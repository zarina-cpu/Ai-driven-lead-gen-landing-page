import { services, studio } from "./knowledge.js";

function missingBANT(lead) {
  const gaps = [];
  if (!lead.extractedBANT.budget) gaps.push("budget");
  if (!lead.extractedBANT.need) gaps.push("need");
  if (!lead.extractedBANT.timeline) gaps.push("timeline");
  return gaps;
}

function findService(text) {
  const lower = text.toLowerCase();
  if (lower.includes("скрипт")) return services.find((item) => item.id === "scripts");
  if (lower.includes("почт") || lower.includes("форм") || lower.includes("заявк")) {
    return services.find((item) => item.id === "inbox");
  }
  if (lower.includes("чат") || lower.includes("сайт") || lower.includes("бот")) {
    return services.find((item) => item.id === "chat");
  }
  return null;
}

export function mockLeadBot({ message, lead }) {
  const service = findService(message);
  const gaps = missingBANT(lead);
  const extractedBANT = { ...lead.extractedBANT };
  let contactInfo = lead.contactInfo;
  const sentences = [];

  if (service) {
    extractedBANT.need = extractedBANT.need || service.title;
    sentences.push(
      `${service.title} в Ташкенте стоит ${service.price}${service.retainer ? `, ${service.retainer}` : ""}, срок ${service.timeline}.`,
    );
  } else if (message.toLowerCase().includes("адрес") || message.toLowerCase().includes("офис")) {
    sentences.push(`Офис: ${studio.address}, ориентир ${studio.landmark}.`);
  } else if (message.toLowerCase().includes("телефон") || message.toLowerCase().includes("номер")) {
    sentences.push(`Наш номер ${studio.phone}, пн–пт 09:00–18:00 по Ташкенту.`);
  } else {
    sentences.push("Работаем с компаниями по Узбекистану: чат на сайте, разбор заявок и скрипты для менеджеров.");
  }

  if (gaps.includes("need") && !extractedBANT.need) {
    sentences.push("Какая задача сейчас главная: чат, почта или скрипты?");
  } else if (gaps.includes("budget")) {
    sentences.push("Какой бюджет в сумах закладываете: до 15 млн, 15–40, 40–80 или больше?");
  } else if (gaps.includes("timeline")) {
    sentences.push("В какие сроки нужно запустить: в ближайшие дни, в течение месяца или пока смотрите рынок?");
  } else if (!contactInfo) {
    sentences.push("Оставьте имя и телефон +998 или Telegram, менеджер в Ташкенте перезвонит.");
  } else {
    sentences.push("Данные уже у менеджера, он свяжется в рабочие часы.");
  }

  return {
    reply: sentences.slice(0, 3).join(" "),
    extractedBANT,
    contactInfo,
    chatSummary: [extractedBANT.need, extractedBANT.budget, extractedBANT.timeline, contactInfo?.value]
      .filter(Boolean)
      .join("; "),
  };
}
