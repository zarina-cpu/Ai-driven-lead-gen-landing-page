export const studio = {
  name: "Три вопроса",
  city: "Ташкент",
  address: "г. Ташкент, Мирабадский район, ул. Амира Темура, 108",
  landmark: "станция метро «Амир Темур хиёбони»",
  phone: "+998 71 200 45 67",
  hours: "пн–пт, 09:00–18:00, время Ташкента (UTC+5)",
  note: "Учебный адрес и номер для лендинга.",
};

export const services = [
  {
    id: "chat",
    title: "Чат на сайте",
    price: "от 18 000 000 сум",
    retainer: "сопровождение 4 500 000 сум/мес",
    timeline: "3 недели",
    text: "Квалифицирует заявки по бюджету, задаче и сроку, пока менеджер ещё не снял трубку.",
  },
  {
    id: "inbox",
    title: "Разбор заявок из почты и форм",
    price: "от 12 000 000 сум",
    retainer: null,
    timeline: "2 недели",
    text: "Собирает письма и формы в одну очередь и помечает, кому звонить первым.",
  },
  {
    id: "scripts",
    title: "Скрипты для менеджеров",
    price: "от 9 000 000 сум",
    retainer: null,
    timeline: "10 дней",
    text: "Короткие реплики на узбекский рынок: бюджет в сумах, контакт +998 или Telegram.",
  },
];

export const niches = [
  { id: "services", title: "Услуги", text: "Клиника, школа, агентство, сервис" },
  { id: "trade", title: "Торговля", text: "Магазин, маркетплейс, опт" },
  { id: "production", title: "Производство", text: "Цех, фабрика, поставки" },
  { id: "other", title: "Другое", text: "Своя ниша, опишем в чате" },
];

export const budgets = [
  { id: "under15", title: "до 15 млн сум", hint: "скрипты или пилот" },
  { id: "15-40", title: "15–40 млн сум", hint: "чат или разбор заявок" },
  { id: "40-80", title: "40–80 млн сум", hint: "чат и сопровождение" },
  { id: "over80", title: "от 80 млн сум", hint: "несколько точек входа" },
];

export const timelines = [
  { id: "yesterday", title: "Вчера", text: "Нужно запустить в ближайшие дни" },
  { id: "month", title: "В течение месяца", text: "Есть окно на внедрение" },
  { id: "research", title: "Просто изучаю рынок", text: "Считаем бюджет и сроки" },
];

export const pains = [
  { id: "no-budget", title: "Заявки без бюджета" },
  { id: "slow-call", title: "Менеджер тратит звонок на квалификацию" },
  { id: "lost-hot", title: "Горячие лиды тонут в общей очереди" },
  { id: "night", title: "Заявки ночью и в выходные" },
];

export function knowledgeForPrompt() {
  return services
    .map((item) => {
      const retainer = item.retainer ? `, ${item.retainer}` : "";
      return `${item.title}: ${item.price}${retainer}, срок ${item.timeline}. ${item.text}`;
    })
    .join("\n");
}
