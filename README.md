# Ai-driven lead gen landing page

Лендинг студии «Три вопроса» (Ташкент): квиз из 5 шагов, LeadBot на Gemini, BANT-статус, заявки в Telegram и локально в `data/leads.json`.

## Запуск

```bash
npm install
copy .env.example .env
npm run dev
```

Переменные окружения — в `.env.example`. Chat id для Telegram: `npm run telegram:chat-id -- --write` после сообщения боту.

**API `/api/leads` и `/api/chat`** работают при `npm run dev`, `npm run preview` или деплое на **Vercel** (папка `api/`). На чистом GitHub Pages без backend будет 404 — тогда деплой на Vercel или задайте `VITE_API_BASE` на URL с API.

### Vercel

1. Import репозитория, Framework Preset: **Vite**.
2. **Environment Variables** (Production): `GEMINI_API_KEY`, `GEMINI_MODEL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, при необходимости `CRM_WEBHOOK_URL`.
3. После push в `main` — redeploy.

## Стек

Vite, React 19, JavaScript, Tailwind CSS 4.
