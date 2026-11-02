import { Button } from "@/components/ui/button.jsx";
import { useApp } from "@/context/AppContext.jsx";
import { statusCopy } from "@/lib/lead.js";
import { studio } from "@/lib/knowledge.js";

const slots = [
  { key: "need", label: "задача" },
  { key: "budget", label: "бюджет" },
  { key: "timeline", label: "срок" },
];

export function Hero() {
  const { openQuiz, openChat, lead } = useApp();
  const temperature = statusCopy[lead.status];

  return (
    <section id="top" className="hero-yufa motion-in pb-16 pt-10 sm:pb-20 sm:pt-14">
      <div className="relative z-[1] mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:gap-12">
        <div>
          <p className="kicker kicker-light">{studio.city}, мирабадский район</p>
          <h1 className="title title-light title-no-rule mt-4 max-w-3xl text-[clamp(2rem,6vw,3.75rem)]">
            Три вопроса. Потом звонит менеджер.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/90 sm:text-lg">
            Ставим на сайт расчёт и LeadBot. Заявка приходит в CRM уже с суммами, сроком и телефоном +998 или Telegram.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={openQuiz}>Запустить AI-расчёт</Button>
            <Button variant="line" onClick={openChat}>
              Вопрос ассистенту
            </Button>
          </div>
        </div>

        <aside className="card-yufa bg-paper p-6 text-ink">
          <p className="kicker">температура лида</p>
          <p
            className={`title mt-3 text-3xl ${
              lead.status === "hot" ? "text-hot" : lead.status === "warm" ? "text-warm" : "text-cold"
            }`}
          >
            {temperature}
          </p>
          <p className="mt-3 text-sm">Температура лида по BANT. Считает код (не модель).</p>
          <ol className="mt-6 grid gap-4">
            {slots.map((slot, index) => (
              <li key={slot.key} className="border-t border-line pt-3">
                <p className="text-xs font-bold capitalize tracking-wide text-mute">
                  {index + 1}. {slot.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">{lead.extractedBANT[slot.key] || "ещё пусто"}</p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
      <div className="hero-wave" aria-hidden="true" />
    </section>
  );
}
