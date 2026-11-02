import * as Dialog from "@radix-ui/react-dialog";
import { Briefcase, Factory, Store, X, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { QuizProgress } from "@/components/Quiz/QuizProgress.jsx";
import { useApp } from "@/context/AppContext.jsx";
import { budgets, niches, pains, timelines } from "@/lib/knowledge.js";
import { isValidContact, isValidName } from "@/lib/validate.js";
import { cn } from "@/lib/utils.js";

const icons = {
  services: Briefcase,
  trade: Store,
  production: Factory,
  other: MoreHorizontal,
};

const emptyAnswers = {
  niche: "",
  budget: "",
  timeline: "",
  painIds: [],
  painNote: "",
};

export function QuizModal() {
  const { quizOpen, closeQuiz, applyQuizDraft, finishQuiz, submitState, setSubmitState } = useApp();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const need = useMemo(() => {
    const selected = pains.filter((item) => answers.painIds.includes(item.id)).map((item) => item.title);
    return [...selected, answers.painNote].filter(Boolean).join(". ");
  }, [answers]);

  function patch(next) {
    const merged = { ...answers, ...next };
    setAnswers(merged);
    applyQuizDraft({
      niche: niches.find((item) => item.id === merged.niche)?.title || "",
      budget: merged.budget,
      timeline: merged.timeline,
      need: [...pains.filter((item) => merged.painIds.includes(item.id)).map((item) => item.title), merged.painNote]
        .filter(Boolean)
        .join(". "),
    });
  }

  function canNext() {
    if (step === 1) return Boolean(answers.niche);
    if (step === 2) return Boolean(answers.budget);
    if (step === 3) return Boolean(answers.timeline);
    if (step === 4) return answers.painIds.length > 0 || answers.painNote.trim().length > 2;
    return isValidName(name) && isValidContact(contact);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitState.sent) return;
    if (!canNext()) {
      setError("Введите имя и телефон +998 или Telegram @username");
      return;
    }
    setSending(true);
    setError("");
    try {
      await finishQuiz(
        {
          niche: niches.find((item) => item.id === answers.niche)?.title || "",
          budget: answers.budget,
          timeline: answers.timeline,
          need,
          painIds: answers.painIds,
        },
        { name: name.trim(), value: contact.trim() },
      );
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSending(false);
    }
  }

  function resetAndClose() {
    closeQuiz();
    setStep(1);
    setAnswers(emptyAnswers);
    setName("");
    setContact("");
    setError("");
    setSubmitState({ sent: false, error: "" });
  }

  return (
    <Dialog.Root open={quizOpen} onOpenChange={(open) => (open ? null : closeQuiz())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/50" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-paper p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90dvh] sm:w-[min(40rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-line sm:p-6 sm:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="title title-no-rule text-xl">AI-расчёт</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" className="min-h-11 min-w-11 px-0" aria-label="Закрыть расчёт">
                <X size={18} />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-sm text-mute">
            Пять шагов. Отправка откроется после телефона +998 или Telegram.
          </Dialog.Description>

          <form className="mt-6 flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
              <QuizProgress step={submitState.sent ? 5 : step} total={5} />

              <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
                {submitState.sent ? (
                  <div className="py-4">
                    <p className="font-display text-2xl">Заявка ушла</p>
                    <p className="mt-3 text-sm text-mute">
                      Менеджер в Ташкенте увидит бюджет, задачу, срок и контакт. Статус уже посчитан на карточке лида.
                    </p>
                  </div>
                ) : null}

                {!submitState.sent && step === 1 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {niches.map((item) => {
                      const Icon = icons[item.id];
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => patch({ niche: item.id })}
                          className={cn(
                            "min-h-20 rounded-xl border px-4 py-4 text-left",
                            answers.niche === item.id ? "border-accent bg-sheet" : "border-line",
                          )}
                        >
                          <Icon size={18} />
                          <span className="mt-3 block font-semibold">{item.title}</span>
                          <span className="mt-1 block text-sm text-mute">{item.text}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {!submitState.sent && step === 2 ? (
                  <div className="grid gap-3">
                    {budgets.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => patch({ budget: item.title })}
                        className={cn(
                          "min-h-14 rounded-xl border px-4 py-3 text-left",
                          answers.budget === item.title ? "border-accent bg-sheet" : "border-line",
                        )}
                      >
                        <span className="font-semibold">{item.title}</span>
                        <span className="mt-1 block text-sm text-mute">{item.hint}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {!submitState.sent && step === 3 ? (
                  <div className="grid gap-3">
                    {timelines.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => patch({ timeline: item.title })}
                        className={cn(
                          "min-h-14 rounded-xl border px-4 py-3 text-left",
                          answers.timeline === item.title ? "border-accent bg-sheet" : "border-line",
                        )}
                      >
                        <span className="font-semibold">{item.title}</span>
                        <span className="mt-1 block text-sm text-mute">{item.text}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {!submitState.sent && step === 4 ? (
                  <div className="grid gap-3">
                    {pains.map((item) => {
                      const checked = answers.painIds.includes(item.id);
                      return (
                        <label key={item.id} className={cn("flex min-h-12 items-center gap-3 rounded-xl border px-4", checked ? "border-accent bg-sheet" : "border-line")}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const painIds = checked
                                ? answers.painIds.filter((id) => id !== item.id)
                                : [...answers.painIds, item.id];
                              patch({ painIds });
                            }}
                          />
                          {item.title}
                        </label>
                      );
                    })}
                    <textarea
                      value={answers.painNote}
                      onChange={(event) => patch({ painNote: event.target.value })}
                      className="min-h-24 w-full border border-line bg-sheet px-3 py-2 text-sm"
                      placeholder="Опишите вашу задачу или бизнес-потребности..."
                    />
                  </div>
                ) : null}

                {!submitState.sent && step === 5 ? (
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm">
                      Имя
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="min-h-11 border border-line bg-sheet px-3"
                        autoComplete="name"
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      Телефон +998 или Telegram
                      <input
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        className="min-h-11 border border-line bg-sheet px-3"
                        placeholder="+998 90 123 45 67 или @username"
                        autoComplete="tel"
                      />
                    </label>
                  </div>
                ) : null}
              </div>

              {error ? <p className="mt-3 text-sm text-hot">{error}</p> : null}

              <div className="mt-4 flex gap-3 pb-[env(safe-area-inset-bottom)]">
                {submitState.sent ? (
                  <Button type="button" className="flex-1" onClick={resetAndClose}>
                    Закрыть
                  </Button>
                ) : (
                  <>
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
                        Назад
                      </Button>
                    ) : null}
                    {step < 5 ? (
                      <Button type="button" className="flex-1" disabled={!canNext()} onClick={() => setStep((value) => value + 1)}>
                        Дальше
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1" disabled={!canNext() || sending}>
                        {sending ? "Отправка…" : "Отправить расчёт"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
