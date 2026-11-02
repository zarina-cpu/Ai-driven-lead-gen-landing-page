/**
 * Копирует переменные из .env в Vercel (Production, Preview, Development).
 *
 *   npm run vercel:env -- --yes
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const projectName = process.env.VERCEL_PROJECT || "aidrivenleadgenlandingpage";
const autoYes = process.argv.includes("--yes");
const skipDeploy = process.argv.includes("--no-deploy");
const environments = "production,preview,development";
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
  if (fs.existsSync(path.join(root, ".vercel", "project.json"))) return true;
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

if (!ensureLinked()) process.exit(1);

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const required = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "GEMINI_API_KEY"];
const missingRequired = required.filter((key) => !env[key]?.trim());
if (missingRequired.length) {
  console.error("В .env не хватает:", missingRequired.join(", "));
  process.exit(1);
}

if (!autoYes) {
  console.log("Синхронизация .env → Vercel (", environments, ")");
  console.log("npm run vercel:env -- --yes");
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
    environments,
    "--value",
    value,
    "--yes",
    "--force",
    "--sensitive",
  ]);
  if (add.status === 0) {
    console.log("OK", key);
  } else {
    console.error("FAIL", key, (add.stderr || add.stdout).split("\n").slice(0, 3).join(" "));
    process.exit(1);
  }
}

console.log("\nПеременные на Vercel обновлены:", environments);

if (!skipDeploy) {
  console.log("Production deploy…");
  const deploy = runVercel(["deploy", "--prod", "-y", "--no-wait"]);
  if (deploy.status !== 0) {
    console.error(deploy.stderr || deploy.stdout);
    process.exit(1);
  }
  console.log("Deploy запущен.");
}

console.log("Проверка: https://aidrivenleadgenlandingpage.vercel.app/api/telegram-check");
