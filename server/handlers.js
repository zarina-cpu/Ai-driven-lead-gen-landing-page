import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leadBotSystemPrompt } from "../src/lib/prompt.js";
import { mockLeadBot } from "../src/lib/mockAI.js";
import { calcStatus, mergeBANT, withStatus } from "../src/lib/lead.js";
import { sendLeadToTelegram, sendChatToTelegram } from "./telegram.js";

const projectRoot = path.join(path.dirname(fileURLToPath(new URL(".", import.meta.url))), "..");
const leadsFile = path.join(projectRoot, "data", "leads.json");

async function appendLead(lead) {
  try {
    await fs.mkdir(path.dirname(leadsFile), { recursive: true });
    let list = [];
    try {
      list = JSON.parse(await fs.readFile(leadsFile, "utf8"));
    } catch {
      list = [];
    }
    list.push({ ...lead, receivedAt: new Date().toISOString() });
    await fs.writeFile(leadsFile, JSON.stringify(list, null, 2), "utf8");
  } catch {
    // На serverless (Vercel) файловая система только для чтения — Telegram/CRM всё равно работают.
  }
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

  const preferred = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const models = [...new Set([preferred, "gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.8-flash", "gemini-3.7-flash"])];
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
          signal: AbortSignal.timeout(15000),
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

export async function postChat(body) {
  const lead = body.lead;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!lead) {
    const error = new Error("Нет данных лида");
    error.status = 400;
    throw error;
  }

  let result;
  try {
    result = await askGemini(messages, lead);
  } catch (geminiError) {
    const lastUser = [...messages].reverse().find((item) => item.role === "user");
    result = mockLeadBot({ message: lastUser?.content || "", lead });
    result.geminiError = geminiError?.message;
  }

  const extractedBANT = mergeBANT(lead.extractedBANT, result.extractedBANT);
  const lastUser = [...messages].reverse().find((item) => item.role === "user");
  const chatTelegram = await sendChatToTelegram({
    lead: withStatus({ ...lead, extractedBANT, contactInfo: result.contactInfo || lead.contactInfo }),
    userText: lastUser?.content || "",
    reply: result.reply,
  }).catch((error) => ({ telegram: false, telegramReason: error.message }));

  return {
    reply: result.reply,
    extractedBANT,
    contactInfo: result.contactInfo || lead.contactInfo,
    chatSummary: result.chatSummary || lead.chatSummary,
    status: calcStatus(extractedBANT),
    mock: Boolean(result.geminiError) || !process.env.GEMINI_API_KEY,
    geminiError: result.geminiError || null,
    ...chatTelegram,
  };
}

export async function postLead(body) {
  if (!body?.contactInfo?.value) {
    const error = new Error("Нет контакта для отправки");
    error.status = 400;
    throw error;
  }
  const lead = withStatus(body);
  await appendLead(lead);
  const webhook = await forwardWebhook(lead);
  const telegram = await sendLeadToTelegram(lead);
  return { ok: true, status: lead.status, ...webhook, ...telegram };
}
