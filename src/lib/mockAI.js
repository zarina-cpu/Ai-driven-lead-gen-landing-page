import { services, studio } from "./knowledge.js";
import { extractBANTFromConversation, findServiceInText } from "./parseBANT.js";
import { extractContactFromText, isValidContact } from "./validate.js";

function missingBANT(extractedBANT) {
  const gaps = [];
  if (!extractedBANT.budget) gaps.push("budget");
  if (!extractedBANT.need) gaps.push("need");
  if (!extractedBANT.timeline) gaps.push("timeline");
  return gaps;
}

export function mockLeadBot({ message, messages, lead }) {
  const extractedBANT = extractBANTFromConversation({ message, messages, lead });
  let contactInfo = lead.contactInfo || null;

  const contactFromText = extractContactFromText(message);
  if (contactFromText && isValidContact(contactFromText)) {
    contactInfo = { name: contactInfo?.name || "", value: contactFromText };
  }

  const gaps = missingBANT(extractedBANT);
  const sentences = [];
  const service = findServiceInText(message) || services.find((s) => s.title === extractedBANT.need);
  const justBudget = /^\d[\d\s]{5,}$/.test(String(message).trim());

  if (justBudget && extractedBANT.budget) {
    sentences.push(`Записал бюджет ${extractedBANT.budget}.`);
    if (extractedBANT.need) {
      sentences.push(`Услуга: ${extractedBANT.need}.`);
    }
  } else if (service && gaps.length >= 2) {
    sentences.push(
      `${service.title} в Ташкенте — ${service.price}, срок по пакету ${service.timeline}. ${service.text}`,
    );
  } else if (message.toLowerCase().includes("адрес") || message.toLowerCase().includes("офис")) {
    sentences.push(`Офис: ${studio.address}, ориентир ${studio.landmark}.`);
  } else if (message.toLowerCase().includes("телефон") || message.toLowerCase().includes("номер")) {
    sentences.push(`Наш номер ${studio.phone}, ${studio.hours}.`);
  } else if (extractedBANT.need && extractedBANT.budget && extractedBANT.timeline) {
    sentences.push(
      `Итого: ${extractedBANT.need}, бюджет ${extractedBANT.budget}, срок ${extractedBANT.timeline}.`,
    );
  } else if (extractedBANT.need || extractedBANT.budget || extractedBANT.timeline) {
    const parts = [];
    if (extractedBANT.need) parts.push(`задача — ${extractedBANT.need}`);
    if (extractedBANT.budget) parts.push(`бюджет — ${extractedBANT.budget}`);
    if (extractedBANT.timeline) parts.push(`срок — ${extractedBANT.timeline}`);
    sentences.push(`Уже есть: ${parts.join("; ")}.`);
  } else {
    sentences.push("Работаем с компаниями по Узбекистану: чат на сайте, разбор заявок и скрипты для менеджеров.");
  }

  if (gaps.includes("need")) {
    sentences.push("Какая задача: чат на сайте, разбор заявок из почты или скрипты для менеджеров?");
  } else if (gaps.includes("budget")) {
    sentences.push("Какой бюджет в сумах (можно числом, например 20 000 000)?");
  } else if (gaps.includes("timeline")) {
    sentences.push("Срок в днях или неделях (например 12 дней или 2 недели)?");
  } else if (!contactInfo?.value) {
    sentences.push("Оставьте имя и телефон +998 или Telegram @username — менеджер перезвонит.");
  } else {
    sentences.push("Данные у менеджера, свяжемся в рабочие часы пн–пт.");
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
