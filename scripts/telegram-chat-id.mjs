import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL(".", import.meta.url)));
const envPath = fs.existsSync(path.join(process.cwd(), ".env"))
  ? path.join(process.cwd(), ".env")
  : path.join(root, "..", ".env");

function readEnv() {
  if (!fs.existsSync(envPath)) {
    console.error("Файл .env не найден. Скопируйте .env.example в .env");
    process.exit(1);
  }
  const text = fs.readFileSync(envPath, "utf8");
  const token = text.match(/^TELEGRAM_BOT_TOKEN=(.*)$/m)?.[1]?.trim();
  const chatId = text.match(/^TELEGRAM_CHAT_ID=(.*)$/m)?.[1]?.trim();
  return { text, token, chatId };
}

const { text, token, chatId } = readEnv();
if (!token) {
  console.error("В .env нет TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

const me = await fetch(`https://api.telegram.org/bot${token}/getMe`).then((r) => r.json());
if (!me.ok) {
  console.error("Токен не принят:", me.description);
  process.exit(1);
}

console.log(`Бот: @${me.result.username}`);
console.log("1. Откройте бота в Telegram и нажмите Start (или отправьте любое сообщение).");
console.log("2. Запустите этот скрипт снова.\n");

const updates = await fetch(`https://api.telegram.org/bot${token}/getUpdates`).then((r) => r.json());
if (!updates.ok) {
  console.error("getUpdates:", updates.description);
  process.exit(1);
}

const ids = [];
for (const update of updates.result || []) {
  const id =
    update.message?.chat?.id ??
    update.edited_message?.chat?.id ??
    update.my_chat_member?.chat?.id;
  if (id != null) ids.push(String(id));
}

const unique = [...new Set(ids)];
if (!unique.length) {
  console.log("Пока нет сообщений боту — chat id не найден.");
  process.exit(0);
}

const resolved = unique[unique.length - 1];
console.log("Найденные chat id:", unique.join(", "));
console.log("Рекомендуемый TELEGRAM_CHAT_ID:", resolved);

if (chatId === resolved) {
  console.log("\nВ .env уже указан этот chat id.");
  process.exit(0);
}

if (process.argv.includes("--write")) {
  const next = text.replace(/^TELEGRAM_CHAT_ID=.*$/m, `TELEGRAM_CHAT_ID=${resolved}`);
  fs.writeFileSync(envPath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
  console.log("\nЗаписано в .env. Перезапустите npm run dev.");
} else {
  console.log("\nЧтобы записать в .env автоматически: npm run telegram:chat-id -- --write");
}
