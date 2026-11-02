export function Pains() {
  const items = [
    {
      title: "Заявки без бюджета и срока",
      text: "Менеджер в Ташкенте тратит первый звонок, чтобы понять, есть ли 15 млн сум и окно на внедрение.",
    },
    {
      title: "Квалификация на трубке",
      text: "Пока идёт разговор, следующая заявка из формы уже остывает в общей очереди.",
    },
    {
      title: "Горячие лиды тонут",
      text: "Ночные заявки с Telegram и «нужно вчера» стоят рядом с теми, кто только смотрит рынок.",
    },
  ];

  return (
    <section id="pains" className="bg-sheet">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="kicker text-center">что ломает продажи</p>
        <h2 className="title mx-auto mt-3 max-w-2xl text-center text-[clamp(1.75rem,4vw,2.75rem)] after:mx-auto">
          Звонок начинается с пустых полей
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.title} className="card-yufa bg-paper p-7 transition-transform hover:-translate-y-1">
              <p className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-2 to-accent text-lg font-extrabold text-white">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="title title-no-rule mt-5 text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
