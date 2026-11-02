import { getTelegramEnv } from "../server/telegram.js";
import { applyCors, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Только GET" });
    return;
  }

  const { token, chatId } = getTelegramEnv();
  const gemini = Boolean(String(process.env.GEMINI_API_KEY || "").trim());

  sendJson(res, 200, {
    gemini,
    telegramToken: Boolean(token),
    telegramChatId: Boolean(chatId),
    ready: Boolean(token && chatId),
    hint: !token
      ? "Добавьте TELEGRAM_BOT_TOKEN в Vercel → Settings → Environment Variables (Production), затем Redeploy."
      : !chatId
        ? "Добавьте TELEGRAM_CHAT_ID или напишите боту /start и укажите id из npm run telegram:chat-id."
        : "Telegram настроен.",
  });
}
