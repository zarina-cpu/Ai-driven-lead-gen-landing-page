import { createContext, useContext, useMemo, useState } from "react";
import { emptyLead, mergeBANT, withStatus } from "@/lib/lead.js";
import { isValidContact, isValidName } from "@/lib/validate.js";
import { submitLeadToCRM } from "@/lib/crm.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [quizOpen, setQuizOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [lead, setLead] = useState(emptyLead);
  const [messages, setMessages] = useState([]);
  const [submitState, setSubmitState] = useState({ sent: false, error: "", telegramWarning: "" });

  function openQuiz() {
    setQuizOpen(true);
    setChatOpen(false);
  }

  function closeQuiz() {
    setQuizOpen(false);
  }

  function openChat() {
    setChatOpen(true);
    setQuizOpen(false);
  }

  function closeChat() {
    setChatOpen(false);
  }

  function applyQuizDraft(quizAnswers) {
    setLead((current) =>
      withStatus({
        ...current,
        quizAnswers,
        extractedBANT: mergeBANT(current.extractedBANT, {
          budget: quizAnswers.budget || null,
          need: quizAnswers.need || null,
          timeline: quizAnswers.timeline || null,
        }),
      }),
    );
  }

  async function finishQuiz(quizAnswers, contactInfo) {
    if (!isValidName(contactInfo.name) || !isValidContact(contactInfo.value)) {
      throw new Error("Введите имя и телефон +998 или Telegram");
    }

    const nextLead = withStatus({
      ...lead,
      quizAnswers,
      extractedBANT: mergeBANT(lead.extractedBANT, {
        budget: quizAnswers.budget || null,
        need: quizAnswers.need || null,
        timeline: quizAnswers.timeline || null,
      }),
      contactInfo,
      chatSummary: [quizAnswers.niche, quizAnswers.budget, quizAnswers.timeline, quizAnswers.need]
        .filter(Boolean)
        .join("; "),
    });

    setLead(nextLead);
    const result = await submitLeadToCRM(nextLead);
    setSubmitState({
      sent: true,
      error: "",
      telegramWarning: result.telegram === false ? result.telegramReason || "Telegram не отправил уведомление." : "",
    });
    return result;
  }

  function applyChatResult({ reply, extractedBANT, contactInfo, chatSummary }) {
    setMessages((current) => [...current, { role: "assistant", content: reply }]);
    setLead((current) =>
      withStatus({
        ...current,
        extractedBANT: mergeBANT(current.extractedBANT, extractedBANT),
        contactInfo: contactInfo || current.contactInfo,
        chatSummary: chatSummary || current.chatSummary,
      }),
    );
  }

  async function sendChatContactIfReady(nextLead) {
    if (!nextLead.contactInfo?.value || submitState.sent) return;
    try {
      const result = await submitLeadToCRM(nextLead);
      setSubmitState({
        sent: true,
        error: "",
        telegramWarning: result.telegram === false ? result.telegramReason || "Telegram не отправил уведомление." : "",
      });
    } catch (error) {
      setSubmitState({ sent: false, error: error.message });
    }
  }

  const value = useMemo(
    () => ({
      quizOpen,
      chatOpen,
      lead,
      messages,
      submitState,
      setMessages,
      setSubmitState,
      openQuiz,
      closeQuiz,
      openChat,
      closeChat,
      applyQuizDraft,
      finishQuiz,
      applyChatResult,
      sendChatContactIfReady,
    }),
    [quizOpen, chatOpen, lead, messages, submitState],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp только внутри AppProvider");
  return context;
}
