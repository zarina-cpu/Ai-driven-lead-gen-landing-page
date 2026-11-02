import { services, studio } from "./knowledge.js";
import { formatManagerScriptsForChat } from "./managerScripts.js";
import { extractContactFromText, isValidContact } from "./validate.js";

function missingBANT(lead) {
  const gaps = [];
  if (!lead.extractedBANT?.budget) gaps.push("budget");
  if (!lead.extractedBANT?.need) gaps.push("need");
  if (!lead.extractedBANT?.timeline) gaps.push("timeline");
  return gaps;
}

function findService(text) {
  const lower = text.toLowerCase();
  if (lower.includes("скрипт") || lower.includes("менеджер") || lower.includes("реплик")) {
    return services.find((item) => item.id === "scripts");
  }
  if (lower.includes("почт") || lower.includes("форм") || lower.includes("заявк")) {
    return services.find((item) => item.id === "inbox");
  }
  if (lower.includes("чат") || lower.includes("сайт") || lower.includes("бот")) {
    return services.find((item) => item.id === "chat");
  }
  return null;
}

function parseBudgetHint(text) {
  const lower = text.toLowerCase();
  if (/до\s*15|under|мало/.test(lower)) return "до 15 млн сум";
  if (/15\s*[–-]\s*40|15-40/.test(lower)) return "15–40 млн сум";
  if (/40\s*[–-]\s*80|40-80/.test(lower)) return "40–80 млн сум";
  if (/80|больше|от\s*80/.test(lower)) return "от 80 млн сум";
  if (/\d+\s*млн/.test(lower)) {
    const match = lower.match(/(\d[\d\s–-]*млн[^.]*)/);
    if (match) return match[1].replace(/\s+/g, " ").trim();
  }
  return null;
}

function parseTimelineHint(text) {
  const lower = text.toLowerCase();
  if (/вчера|сроч|сегодня|завтра|дней/.test(lower)) return "В ближайшие дни";
  if (/месяц|недел/.test(lower)) return "В течение месяца";
  if (/изуч|смотр|позже/.test(lower)) return "Изучение рынка";
  return null;
}

function wantsManagerScripts(text) {
  const lower = text.toLowerCase();
  return /скрипт|менеджер|реплик|звон(ок|а)|возраж|дорого|bant|бант/.test(lower);
}

function wantsPrices(text) {
  const lower = text.toLowerCase();
  return /цен|стоим|пакет|сколько|прайс|сум/.test(lower);
}

function wantsOffice(text) {
  const lower = text.toLowerCase();
  return /адрес|офис|метро|ташкент|где вы/.test(lower);
}

function wantsPhone(text) {
  const lower = text.toLowerCase();
  return /телефон|номер|позвон|связ/.test(lower);
}

/** Быстрый ответ без Gemini — скрипты, цены, офис, BANT. */
export function shouldUseLocalChat(message) {
  const lower = String(message || "").toLowerCase().trim();
  if (!lower) return false;
  if (lower.length <= 120 && /^(привет|здравств|салам|ассалому|hello|hi)\b/.test(lower)) return true;
  return (
    wantsManagerScripts(lower) ||
    wantsPrices(lower) ||
    wantsOffice(lower) ||
    wantsPhone(lower) ||
    Boolean(findService(lower)) ||
    Boolean(parseBudgetHint(lower)) ||
    Boolean(parseTimelineHint(lower))
  );
}

export function buildLocalChatReply({ message, lead }) {
  const extractedBANT = { ...(lead.extractedBANT || {}) };
  let contactInfo = lead.contactInfo || null;
  const lower = message.toLowerCase();
  const sentences = [];

  const budgetHint = parseBudgetHint(message);
  const timelineHint = parseTimelineHint(message);
  if (budgetHint) extractedBANT.budget = extractedBANT.budget || budgetHint;
  if (timelineHint) extractedBANT.timeline = extractedBANT.timeline || timelineHint;

  const contactFromText = extractContactFromText(message);
  if (contactFromText && isValidContact(contactFromText)) {
    contactInfo = { name: contactInfo?.name || "", value: contactFromText };
  }

  if (wantsManagerScripts(message)) {
    extractedBANT.need = extractedBANT.need || "Скрипты для менеджеров";
    sentences.push("Готовые реплики для менеджера в Ташкенте (копируйте в CRM или телефон):");
    sentences.push(formatManagerScriptsForChat());
    sentences.push(`Пакет «Скрипты для менеджеров» — ${services.find((s) => s.id === "scripts").price}, срок 10 дней.`);
  } else if (wantsPrices(message)) {
    sentences.push(
      services.map((s) => `${s.title}: ${s.price}${s.retainer ? `, ${s.retainer}` : ""}, ${s.timeline}.`).join(" "),
    );
  } else if (wantsOffice(message)) {
    sentences.push(`Офис: ${studio.address}. Ориентир: ${studio.landmark}. ${studio.hours}.`);
  } else if (wantsPhone(message)) {
    sentences.push(`Телефон студии: ${studio.phone}, ${studio.hours}.`);
  } else {
    const service = findService(message);
    if (service) {
      extractedBANT.need = extractedBANT.need || service.title;
      sentences.push(
        `${service.title}: ${service.price}${service.retainer ? `, ${service.retainer}` : ""}. Срок ${service.timeline}. ${service.text}`,
      );
    } else {
      sentences.push("«Три вопроса», Ташкент: чат на сайте, разбор заявок, скрипты для менеджеров. Спросите «скрипты для менеджеров» — пришлю готовые реплики.");
    }
  }

  const gaps = missingBANT({ extractedBANT });
  if (!contactInfo?.value) {
    if (gaps.includes("budget") && !budgetHint) {
      sentences.push("Какой бюджет в сумах: до 15 млн, 15–40, 40–80 или выше?");
    } else if (gaps.includes("timeline") && !timelineHint) {
      sentences.push("Когда нужно запустить: срочно, в месяц или пока изучаете рынок?");
    } else if (gaps.includes("need") && !extractedBANT.need) {
      sentences.push("Что важнее: чат на сайте, разбор заявок или скрипты для менеджеров?");
    } else {
      sentences.push("Оставьте +998 или Telegram @username — менеджер перезвонит.");
    }
  }

  const reply =
    wantsManagerScripts(message) && sentences.length > 1
      ? `${sentences[0]}\n\n${sentences[1]}\n\n${sentences.slice(2).join(" ")}`
      : sentences.slice(0, 3).join(" ");

  return {
    reply,
    extractedBANT,
    contactInfo,
    chatSummary: [extractedBANT.need, extractedBANT.budget, extractedBANT.timeline, contactInfo?.value]
      .filter(Boolean)
      .join("; "),
    local: true,
  };
}
