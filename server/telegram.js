function line(label, value) {
  return `${label}: ${value || "—"}`;
}

export function getTelegramEnv() {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = String(process.env.TELEGRAM_CHAT_ID || "").trim();
  return { token, chatId };
}

export function formatLeadMessage(lead) {
  const bant = lead.extractedBANT || {};
  const contact = lead.contactInfo || {};
  const quiz = lead.quizAnswers || {};

  return [
    `Новая заявка — ${String(lead.status || "cold").toUpperCase()}`,
    "",
    line("Имя", contact.name),
    line("Контакт", contact.value),
    line("Задача", bant.need || quiz.need),
    line("Бюджет", bant.budget || quiz.budget),
    line("Срок", bant.timeline || quiz.timeline),
    line("Ниша", quiz.niche),
    line("Резюме", lead.chatSummary),
  ].join("\n");
}

export function formatChatMessage({ lead, userText, reply }) {
  const contact = lead.contactInfo || {};
  return [
    "Сообщение LeadBot",
    "",
    line("Контакт", contact.value),
    line("Статус", lead.status),
    line("Клиент", userText),
    line("Ответ", reply),
  ].join("\n");
}

let cachedChatId = null;

export async function resolveTelegramChatId(token, explicitChatId) {
  if (explicitChatId) return explicitChatId;
  if (cachedChatId) return cachedChatId;

  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || `getUpdates вернул ${response.status}`);
  }

  const updates = Array.isArray(payload.result) ? payload.result : [];
  for (let index = updates.length - 1; index >= 0; index -= 1) {
    const update = updates[index];
    const chatId =
      update.message?.chat?.id ??
      update.edited_message?.chat?.id ??
      update.channel_post?.chat?.id ??
      update.my_chat_member?.chat?.id;
    if (chatId != null) {
      cachedChatId = String(chatId);
      return cachedChatId;
    }
  }

  return null;
}

export async function sendTelegramText(token, chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || `Telegram ответил ${response.status}`);
  }

  return payload;
}

export async function sendLeadToTelegram(lead) {
  const { token, chatId: envChatId } = getTelegramEnv();
  if (!token) {
    return { telegram: false, telegramReason: "TELEGRAM_BOT_TOKEN не задан" };
  }

  const chatId = await resolveTelegramChatId(token, envChatId);
  if (!chatId) {
    return {
      telegram: false,
      telegramReason:
        "TELEGRAM_CHAT_ID пустой. Напишите боту в Telegram (/start), затем укажите chat id из getUpdates или перезапустите сервер.",
    };
  }

  await sendTelegramText(token, chatId, formatLeadMessage(lead));
  return { telegram: true, telegramChatId: chatId };
}

export async function sendChatToTelegram({ lead, userText, reply }) {
  const { token, chatId: envChatId } = getTelegramEnv();
  if (!token) return { telegram: false, telegramReason: "TELEGRAM_BOT_TOKEN не задан" };

  const chatId = await resolveTelegramChatId(token, envChatId);
  if (!chatId) {
    return {
      telegram: false,
      telegramReason: "Нет TELEGRAM_CHAT_ID. Сначала напишите боту в Telegram.",
    };
  }

  await sendTelegramText(token, chatId, formatChatMessage({ lead, userText, reply }));
  return { telegram: true, telegramChatId: chatId };
}

export function logTelegramStartup() {
  const { token, chatId } = getTelegramEnv();
  if (!token) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN не задан — заявки в Telegram не отправляются.");
    return;
  }
  if (!chatId) {
    console.warn(
      "[telegram] TELEGRAM_CHAT_ID пустой — после первого сообщения боту chat id подставится из getUpdates автоматически.",
    );
    return;
  }
  console.log("[telegram] Уведомления включены для chat id", chatId);
}
