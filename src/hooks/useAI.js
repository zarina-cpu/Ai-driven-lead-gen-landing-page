import { useState } from "react";
import { mockLeadBot } from "@/lib/mockAI.js";
import { extractContactFromText, isValidContact } from "@/lib/validate.js";
import { withStatus } from "@/lib/lead.js";
import { useApp } from "@/context/AppContext.jsx";

export function useAI() {
  const { lead, messages, setMessages, applyChatResult, sendChatContactIfReady } = useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(text) {
    const content = text.trim();
    if (!content || pending) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, lead }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Чат не ответил");

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

      const nextLead = withStatus({
        ...lead,
        extractedBANT: payload.extractedBANT,
        contactInfo,
        chatSummary: payload.chatSummary,
      });
      await sendChatContactIfReady(nextLead);
    } catch (requestError) {
      const fallback = mockLeadBot({ message: content, lead });
      applyChatResult(fallback);
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  return { pending, error, sendMessage };
}
