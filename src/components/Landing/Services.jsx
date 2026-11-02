import { services, studio } from "@/lib/knowledge.js";

export function Services() {
  return (
    <section id="services" className="bg-sheet">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="kicker text-center">пакеты</p>
        <h2 className="title mx-auto mt-3 text-center text-[clamp(1.75rem,4vw,2.75rem)] after:mx-auto">Пакеты в сумах</h2>
        <ul className="card-yufa mt-12 divide-y divide-line overflow-hidden bg-paper">
          {services.map((item) => (
            <li key={item.id} className="grid gap-3 px-5 py-6 transition-colors hover:bg-sheet/80 md:grid-cols-[minmax(0,1fr)_12rem_8rem] md:items-baseline sm:px-6">
              <div>
                <h3 className="title title-no-rule text-xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{item.text}</p>
              </div>
              <p className="text-base font-extrabold text-accent">
                {item.price}
                {item.retainer ? <span className="mt-1 block text-sm font-semibold text-mute">{item.retainer}</span> : null}
              </p>
              <p className="text-sm font-semibold capitalize text-ink">{item.timeline}</p>
            </li>
          ))}
        </ul>

        <div
          id="contacts"
          className="relative mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-accent-2 via-accent-2 to-accent p-6 text-white shadow-[0_20px_50px_-20px_rgba(8,188,233,0.55)] sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[14px] border-white/15" />
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="kicker kicker-light">адрес</p>
              <p className="mt-2 text-sm text-white">{studio.address}</p>
              <p className="mt-1 text-sm text-white/75">{studio.landmark}</p>
            </div>
            <div>
              <p className="kicker kicker-light">телефон</p>
              <a className="mt-2 block min-h-11 text-sm font-bold text-white hover:underline" href={`tel:${studio.phone.replace(/\s/g, "")}`}>
                {studio.phone}
              </a>
            </div>
            <div>
              <p className="kicker kicker-light">часы</p>
              <p className="mt-2 text-sm text-white">{studio.hours}</p>
              <p className="mt-2 text-xs text-white/70">{studio.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
