import { readJsonBody, sendJson } from "../src/lib/utils.js";
import { logTelegramStartup } from "./telegram.js";
import { postChat, postLead } from "./handlers.js";

function applyCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

async function handleChat(req, res) {
  const body = await readJsonBody(req);
  const payload = await postChat(body);
  sendJson(res, 200, payload);
}

async function handleLead(req, res) {
  const body = await readJsonBody(req);
  const payload = await postLead(body);
  sendJson(res, 200, payload);
}

function apiMiddleware(req, res, next) {
  const url = req.url?.split("?")[0] || "";
  if (!url.startsWith("/api/")) {
    next();
    return;
  }

  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Только POST" });
    return;
  }

  const run = async () => {
    if (url === "/api/chat") {
      await handleChat(req, res);
      return;
    }
    if (url === "/api/leads") {
      await handleLead(req, res);
      return;
    }
    sendJson(res, 404, { error: "Маршрут не найден" });
  };

  run().catch((error) => {
    sendJson(res, error.status || 500, { error: error.message || "Сервер не ответил" });
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
