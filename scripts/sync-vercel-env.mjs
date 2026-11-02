/**
 * Копирует переменные из .env в Vercel (Production).
 * Нужны: vercel login и vercel link в корне проекта.
 *
 *   npm run vercel:env
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const root = process.cwd();
const envPath = path.join(root, ".env");
const keys = ["GEMINI_API_KEY", "GEMINI_MODEL", "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "CRM_WEBHOOK_URL"];

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function runVercel(args, input) {
  const result = spawnSync("npx", ["vercel", ...args], {
    cwd: root,
    input,
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
  return result;
}

if (!fs.existsSync(envPath)) {
  console.error("Нет файла .env — скопируйте .env.example и заполните ключи.");
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const missing = keys.filter((key) => key !== "CRM_WEBHOOK_URL" && key !== "GEMINI_MODEL" && !env[key]?.trim());
if (missing.length) {
  console.warn("В .env пусто (заполните перед синком):", missing.join(", "));
}

const whoami = runVercel(["whoami"], "");
if (whoami.status !== 0) {
  console.error("Vercel CLI не авторизован. Выполните: npx vercel login");
  process.exit(1);
}
console.log("Vercel:", (whoami.stdout || whoami.stderr).trim());

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const answer = await new Promise((resolve) => {
  rl.question("Записать переменные в Production на Vercel? (y/N) ", resolve);
});
rl.close();
if (answer.trim().toLowerCase() !== "y") {
  console.log("Отменено.");
  process.exit(0);
}

for (const key of keys) {
  const value = env[key]?.trim();
  if (!value) continue;
  runVercel(["env", "rm", key, "production", "-y"], "");
  const add = runVercel(["env", "add", key, "production"], `${value}\n`);
  if (add.status === 0) {
    console.log("OK", key);
  } else {
    console.error("FAIL", key, add.stderr || add.stdout);
  }
}

console.log("\nГотово. Vercel → Deployments → Redeploy последнего билда (Production).");
console.log("Проверка: https://aidrivenleadgenlandingpage.vercel.app/api/telegram-check");
