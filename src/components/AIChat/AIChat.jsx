import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { useApp } from "@/context/AppContext.jsx";
import { useAI } from "@/hooks/useAI.js";
import { statusCopy } from "@/lib/lead.js";
import { cn } from "@/lib/utils.js";

export function AIChat() {
  const { chatOpen, openChat, closeChat, messages, lead, quizOpen } = useApp();
  const { pending, pendingLabel, error, sendMessage } = useAI();
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, pending, chatOpen]);

  function onSubmit(event) {
    event.preventDefault();
    sendMessage(draft);
    setDraft("");
  }

  function sendQuick(text) {
    sendMessage(text);
  }

  return (
    <div className={cn("fixed z-40", quizOpen ? "bottom-4 right-4 hidden sm:block" : "bottom-4 right-4")}>
      {chatOpen ? (
        <section className="flex h-[min(36rem,calc(100dvh-5.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-xl max-sm:fixed max-sm:inset-x-3 max-sm:bottom-3 max-sm:top-3 max-sm:h-auto max-sm:w-auto">
          <header className="flex items-start justify-between gap-3 border-b border-line bg-gradient-to-r from-accent-2 to-accent px-4 py-3 text-white">
            <div>
              <h2 className="title title-light title-no-rule text-base">LeadBot</h2>
              <p className="text-xs text-white/85">
                Лид {statusCopy[lead.status]}
                {lead.contactInfo?.value ? ` · ${lead.contactInfo.value}` : ""}
              </p>
            </div>
            <Button variant="ghost" className="min-h-11 min-w-11 px-0 text-white hover:text-white/80" onClick={closeChat} aria-label="Закрыть чат">
              <X size={18} />
            </Button>
          </header>

          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3 text-sm text-mute">
                <p>Скрипты и цены отвечают сразу. Сложные вопросы — через ИИ (до 12 сек).</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-line bg-sheet px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent"
                    onClick={() => sendQuick("Скрипты для менеджеров")}
                  >
                    Скрипты для менеджеров
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-line bg-sheet px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent"
                    onClick={() => sendQuick("Цены пакетов в сумах")}
                  >
                    Цены
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-line bg-sheet px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent"
                    onClick={() => sendQuick("Адрес офиса в Ташкенте")}
                  >
                    Офис
                  </button>
                </div>
              </div>
            ) : null}
            {messages.map((item, index) => (
              <p
                key={`${item.role}-${index}`}
                className={cn(
                  "max-w-[90%] whitespace-pre-wrap px-3 py-2 text-sm",
                  item.role === "user" ? "ml-auto rounded-2xl rounded-br-md bg-accent text-white" : "rounded-2xl rounded-bl-md bg-sheet text-ink",
                )}
              >
                {item.content}
              </p>
            ))}
            {pending ? <p className="text-sm text-mute">{pendingLabel || "ИИ думает…"}</p> : null}
            {error ? <p className="text-xs text-mute">{error}. Показан локальный ответ.</p> : null}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-sheet px-4 text-sm"
              placeholder="Сообщение"
              aria-label="Сообщение в чат"
            />
            <Button type="submit" className="min-w-11 px-3" disabled={pending || !draft.trim()} aria-label="Отправить">
              <Send size={16} />
            </Button>
          </form>
        </section>
      ) : (
        <Button
          className="h-14 w-14 rounded-full px-0 shadow-lg"
          onClick={openChat}
          aria-label="Задать вопрос ИИ-ассистенту"
        >
          <MessageCircle size={22} />
        </Button>
      )}
    </div>
  );
}
