import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leadBotSystemPrompt } from "../src/lib/prompt.js";
import { mockLeadBot } from "../src/lib/mockAI.js";
import { calcStatus, mergeBANT, withStatus } from "../src/lib/lead.js";
import { readJsonBody, sendJson } from "../src/lib/utils.js";
import { sendLeadToTelegram, sendChatToTelegram, logTelegramStartup } from "./telegram.js";

const rootDir = path.dirname(fileURLToPath(new URL(".", import.meta.url)));
const leadsFile = path.join(rootDir, "data", "leads.json");

async function appendLead(lead) {
  await fs.mkdir(path.dirname(leadsFile), { recursive: true });
  let list = [];
  try {
    list = JSON.parse(await fs.readFile(leadsFile, "utf8"));
  } catch {
    list = [];
  }
  list.push({ ...lead, receivedAt: new Date().toISOString() });
  await fs.writeFile(leadsFile, JSON.stringify(list, null, 2), "utf8");
}

async function forwardWebhook(lead) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return { forwarded: false };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!response.ok) {
    throw new Error(`Вебхук ответил ${response.status}`);
  }
  return { forwarded: true };
}

function parseModelJson(content) {
  const match = String(content || "").match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Модель вернула не JSON");
  return JSON.parse(match[0]);
}

function toGeminiContents(messages) {
  return messages
    .filter((item) => item.content && (item.role === "user" || item.role === "assistant"))
    .map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    }));
}

async function askGemini(messages, lead) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const lastUser = [...messages].reverse().find((item) => item.role === "user");
    return mockLeadBot({ message: lastUser?.content || "", lead });
  }

  const preferred = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const models = [...new Set([preferred, "gemini-3.8-flash", "gemini-3.7-flash"])];
  const payload = {
    systemInstruction: {
      parts: [
        { text: leadBotSystemPrompt },
        {
          text: `Уже известно о лиде: ${JSON.stringify({
            quizAnswers: lead.quizAnswers,
            extractedBANT: lead.extractedBANT,
            contactInfo: lead.contactInfo,
          })}`,
        },
      ],
    },
    contents: toGeminiContents(messages),
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  };

  let lastError = null;
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Gemini ${response.status}`);
      }
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "";
      return parseModelJson(text);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function handleChat(req, res) {
  const body = await readJsonBody(req);
  const lead = body.lead;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!lead) {
    sendJson(res, 400, { error: "Нет данных лида" });
    return;
  }

  const result = await askGemini(messages, lead);
  const extractedBANT = mergeBANT(lead.extractedBANT, result.extractedBANT);
  const lastUser = [...messages].reverse().find((item) => item.role === "user");
  const chatTelegram = await sendChatToTelegram({
    lead: withStatus({ ...lead, extractedBANT, contactInfo: result.contactInfo || lead.contactInfo }),
    userText: lastUser?.content || "",
    reply: result.reply,
  }).catch((error) => ({ telegram: false, telegramReason: error.message }));

  sendJson(res, 200, {
    reply: result.reply,
    extractedBANT,
    contactInfo: result.contactInfo || lead.contactInfo,
    chatSummary: result.chatSummary || lead.chatSummary,
    status: calcStatus(extractedBANT),
    mock: !process.env.GEMINI_API_KEY,
    ...chatTelegram,
  });
}

async function handleLead(req, res) {
  const body = await readJsonBody(req);
  if (!body?.contactInfo?.value) {
    sendJson(res, 400, { error: "Нет контакта для отправки" });
    return;
  }
  const lead = withStatus(body);
  await appendLead(lead);
  const webhook = await forwardWebhook(lead);
  const telegram = await sendLeadToTelegram(lead);
  sendJson(res, 200, { ok: true, status: lead.status, ...webhook, ...telegram });
}

function apiMiddleware(req, res, next) {
  if (req.method !== "POST") {
    next();
    return;
  }

  const url = req.url.split("?")[0];
  const run = async () => {
    if (url === "/api/chat") {
      await handleChat(req, res);
      return;
    }
    if (url === "/api/leads") {
      await handleLead(req, res);
      return;
    }
    next();
  };

  run().catch((error) => {
    sendJson(res, 500, { error: error.message || "Сервер не ответил" });
  });
}

export function leadApiPlugin() {
  return {
    name: "lead-api",
    configureServer(server) {
      logTelegramStartup();
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      logTelegramStartup();
      server.middlewares.use(apiMiddleware);
    },
  };
}
