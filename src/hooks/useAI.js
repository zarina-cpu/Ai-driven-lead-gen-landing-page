import { useState } from "react";
import { buildLocalChatReply, shouldUseLocalChat } from "@/lib/localChat.js";
import { extractContactFromText, isValidContact } from "@/lib/validate.js";
import { withStatus } from "@/lib/lead.js";
import { apiUrl } from "@/lib/apiBase.js";
import { useApp } from "@/context/AppContext.jsx";

const CHAT_TIMEOUT_MS = 12000;

function applyPayload(lead, payload, content, applyChatResult) {
  const valueFromText = extractContactFromText(content);
  const contactInfo =
    payload.contactInfo ||
    (valueFromText && isValidContact(valueFromText)
      ? { name: lead.contactInfo?.name || "", value: valueFromText }
      : lead.contactInfo);

  applyChatResult({
    reply: payload.reply,
    extractedBANT: payload.extractedBANT,
    contactInfo,
    chatSummary: payload.chatSummary,
  });

  return withStatus({
    ...lead,
    extractedBANT: payload.extractedBANT,
    contactInfo,
    chatSummary: payload.chatSummary,
  });
}

export function useAI() {
  const { lead, messages, setMessages, applyChatResult, sendChatContactIfReady } = useApp();
  const [pending, setPending] = useState(false);
  const [pendingLabel, setPendingLabel] = useState("");
  const [error, setError] = useState("");

  async function sendMessage(text) {
    const content = text.trim();
    if (!content || pending) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setError("");

    if (shouldUseLocalChat(content)) {
      const payload = buildLocalChatReply({ message: content, lead });
      const nextLead = applyPayload(lead, payload, content, applyChatResult);
      await sendChatContactIfReady(nextLead);
      return;
    }

    setPending(true);
    setPendingLabel("ИИ думает…");

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
      const response = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, lead }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Чат не ответил");

      const nextLead = applyPayload(lead, payload, content, applyChatResult);
      await sendChatContactIfReady(nextLead);
    } catch (requestError) {
      const fallback = buildLocalChatReply({ message: content, lead });
      applyPayload(lead, fallback, content, applyChatResult);
      setError(requestError.name === "AbortError" ? "Долгий ответ — показаны скрипты и цены локально." : requestError.message);
      await sendChatContactIfReady(
        withStatus({
          ...lead,
          extractedBANT: fallback.extractedBANT,
          contactInfo: fallback.contactInfo || lead.contactInfo,
          chatSummary: fallback.chatSummary,
        }),
      );
    } finally {
      setPending(false);
      setPendingLabel("");
    }
  }

  return { pending, pendingLabel, error, sendMessage };
}
