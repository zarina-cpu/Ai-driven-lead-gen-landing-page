import { services } from "./knowledge.js";

function formatSum(amount) {
  const digits = String(amount).replace(/\D/g, "");
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n < 100_000) return null;
  return `${n.toLocaleString("ru-RU")} сум`;
}

export function parseBudgetFromText(text) {
  const source = String(text || "");
  const lower = source.toLowerCase();

  const range = lower.match(/(до\s*15|15\s*[–-]\s*40|40\s*[–-]\s*80|от\s*80|\d+\s*млн)/);
  if (range) {
    const chunk = range[0];
    if (chunk.includes("до")) return "до 15 млн сум";
    if (/15/.test(chunk) && /40/.test(chunk)) return "15–40 млн сум";
    if (/40/.test(chunk) && /80/.test(chunk)) return "40–80 млн сум";
    if (chunk.includes("80")) return "от 80 млн сум";
    const mln = chunk.match(/(\d+)\s*млн/);
    if (mln) return `${mln[1]} млн сум`;
  }

  const onlyDigits = source.trim().replace(/\s/g, "");
  if (/^\d{6,12}$/.test(onlyDigits)) {
    return formatSum(onlyDigits);
  }

  const embedded = source.match(/(?:бюджет|budget)?\s*[:=]?\s*(\d[\d\s]{5,})/i);
  if (embedded) {
    return formatSum(embedded[1]);
  }

  return null;
}

export function parseTimelineFromText(text) {
  const source = String(text || "").toLowerCase();

  const days = source.match(/(\d+)\s*(дн|день|дней|day)/);
  if (days) return `${days[1]} дней`;

  const weeks = source.match(/(\d+)\s*(нед|недел|week)/);
  if (weeks) return `${weeks[1]} нед.`;

  if (/вчера|сроч|сегодня|завтра/.test(source)) return "В ближайшие дни";
  if (/месяц/.test(source)) return "В течение месяца";
  if (/изуч|смотр|позже/.test(source)) return "Изучение рынка";

  const srok = source.match(/срок\s*[:=]?\s*(\d+\s*(?:дн|нед)[^.]*)/);
  if (srok) return parseTimelineFromText(srok[1]) || srok[1].trim();

  return null;
}

export function findServiceInText(text) {
  const lower = String(text || "").toLowerCase();
  if (lower.includes("скрипт")) return services.find((item) => item.id === "scripts");
  if (lower.includes("почт") || lower.includes("форм") || (lower.includes("разбор") && lower.includes("заяв"))) {
    return services.find((item) => item.id === "inbox");
  }
  if (lower.includes("чат") || lower.includes("сайт") || lower.includes("бот")) {
    return services.find((item) => item.id === "chat");
  }
  return null;
}

/** Собирает BANT из текущего сообщения и истории пользователя. */
export function extractBANTFromConversation({ message, messages, lead }) {
  const userLines = (messages || []).filter((item) => item.role === "user").map((item) => item.content);
  const combined = [...userLines, message].filter(Boolean).join("\n");

  const extractedBANT = {
    budget: lead?.extractedBANT?.budget || null,
    need: lead?.extractedBANT?.need || null,
    timeline: lead?.extractedBANT?.timeline || null,
  };

  for (const chunk of [combined, message]) {
    const budget = parseBudgetFromText(chunk);
    const timeline = parseTimelineFromText(chunk);
    const service = findServiceInText(chunk);
    if (budget) extractedBANT.budget = budget;
    if (timeline) extractedBANT.timeline = timeline;
    if (service) extractedBANT.need = extractedBANT.need || service.title;
  }

  return extractedBANT;
}
