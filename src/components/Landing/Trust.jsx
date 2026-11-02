export function Trust() {
  const rows = [
    { field: "budget", meaning: "Диапазон в сумах из квиза или чата" },
    { field: "need", meaning: "Услуга и формулировка боли" },
    { field: "timeline", meaning: "Вчера, месяц или изучение рынка" },
    { field: "contact", meaning: "Имя и +998 или Telegram" },
    { field: "status", meaning: "cold / warm / hot по числу заполненных полей BANT" },
  ];

  return (
    <section id="trust" className="bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div>
          <p className="kicker">BANT в CRM</p>
          <h2 className="title mt-3 text-[clamp(1.75rem,4vw,2.75rem)]">Что уходит в CRM до звонка</h2>
          <p className="mt-5 text-sm leading-relaxed">
            Пусто — холодный. Одно или два поля — тёплый. Бюджет, задача и срок вместе — горячий. Контакт статус не меняет, без него заявка не уходит.
          </p>
        </div>
        <div className="card-yufa overflow-hidden bg-sheet">
          <table className="w-full border-collapse text-left text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.field} className="border-t border-line first:border-t-0">
                  <th className="w-28 bg-paper/60 py-4 pl-5 pr-4 align-top font-bold capitalize tracking-wide text-accent-2 dark:text-accent">{row.field}</th>
                  <td className="py-4 pr-5">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
