/**
 * Копирует переменные из .env в Vercel (Production).
 *
 *   npx vercel link --yes --project aidrivenleadgenlandingpage
 *   npm run vercel:env -- --yes
 *   npx vercel deploy --prod -y
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const projectName = process.env.VERCEL_PROJECT || "aidrivenleadgenlandingpage";
const autoYes = process.argv.includes("--yes");
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

function runVercel(args) {
  return spawnSync("npx", ["vercel", ...args], {
    cwd: root,
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function ensureLinked() {
  const linked = fs.existsSync(path.join(root, ".vercel", "project.json"));
  if (linked) return true;
  console.log(`Привязка к проекту ${projectName}…`);
  const link = runVercel(["link", "--yes", "--project", projectName]);
  if (link.status !== 0) {
    console.error(link.stderr || link.stdout);
    return false;
  }
  return true;
}

if (!fs.existsSync(envPath)) {
  console.error("Нет файла .env — скопируйте .env.example и заполните ключи.");
  process.exit(1);
}

if (!ensureLinked()) {
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const required = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "GEMINI_API_KEY"];
const missingRequired = required.filter((key) => !env[key]?.trim());
if (missingRequired.length) {
  console.error("В .env не хватает:", missingRequired.join(", "));
  process.exit(1);
}

if (!autoYes) {
  console.log("Добавлю переменные в Production проекта", projectName);
  console.log("Запустите с флагом --yes для подтверждения: npm run vercel:env -- --yes");
  process.exit(0);
}

for (const key of keys) {
  const value = env[key]?.trim();
  if (!value) continue;
  const add = runVercel([
    "env",
    "add",
    key,
    "--environment",
    "production",
    "--value",
    value,
    "--yes",
    "--force",
    "--sensitive",
  ]);
  if (add.status === 0) {
    console.log("OK", key);
  } else {
    console.error("FAIL", key, (add.stderr || add.stdout).split("\n")[0]);
    process.exit(1);
  }
}

console.log("\nПеременные на Vercel (Production) обновлены.");
console.log("Запускаю production deploy…");
const deploy = runVercel(["deploy", "--prod", "-y", "--no-wait"]);
if (deploy.status !== 0) {
  console.error(deploy.stderr || deploy.stdout);
  process.exit(1);
}
console.log((deploy.stdout || deploy.stderr).trim());
console.log("\nПроверка через ~1 мин: https://aidrivenleadgenlandingpage.vercel.app/api/telegram-check");
