# Ai-driven lead gen landing page

Лендинг студии «Три вопроса» (Ташкент): квиз из 5 шагов, LeadBot на Gemini, BANT-статус, заявки в Telegram и локально в `data/leads.json`.

## Запуск

```bash
npm install
copy .env.example .env
npm run dev
```

Переменные окружения — в `.env.example`. Chat id для Telegram: `npm run telegram:chat-id -- --write` после сообщения боту.

## Стек

Vite, React 19, JavaScript, Tailwind CSS 4.
