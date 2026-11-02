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
2. **Environment Variables** — только **Production** (галочка Production, не только Preview):

   | Name | Пример |
   |------|--------|
   | `TELEGRAM_BOT_TOKEN` | из @BotFather |
   | `TELEGRAM_CHAT_ID` | `194681450` или `npm run telegram:chat-id` |
   | `GEMINI_API_KEY` | Google AI Studio |
   | `GEMINI_MODEL` | `gemini-3.8-flash` |

   Имена **без** префикса `VITE_` (это серверные секреты).

3. **Deployments** → последний → **Redeploy** (обязательно после добавления переменных).

4. Проверка: `/api/telegram-check` → `"ready": true`.

   Из терминала (после `npx vercel login` и `npx vercel link`): `npm run vercel:env`

## Стек

Vite, React 19, JavaScript, Tailwind CSS 4.
