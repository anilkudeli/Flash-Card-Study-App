# Flash Card Study App

A full-stack flashcard study app with personal decks, JWT authentication, and a five-box review system.

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

The local database defaults to `mongodb://127.0.0.1:27017/flashcards`.

## Run in two VS Code terminals

1. Backend:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

   This checkout uses `http://localhost:5001` because port 5000 is already occupied on this machine. The sample `.env.example` retains the requested default `5000`.

2. Frontend:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

   Open `http://localhost:5174`. Vite proxies `/api` requests to the backend.

## Run both together

After installing dependencies in `server` and `client` once, run from the project root:

```powershell
npm run dev
```

This starts both servers without adding a process-management dependency. Ports 5000 and 5173 were already occupied in this environment, so this checkout uses 5001 and 5174. Use Ctrl+C to stop both.

## Environment

`server/.env` is ignored by Git and contains local development settings. Copy `server/.env.example` for another machine. Set `MONGODB_URI` to your database and replace `JWT_SECRET` with a long random value before deployment.

Password recovery links expire after 30 minutes and can only be used once. For local development without SMTP, the forgot-password page displays a reset link after submitting an existing account email. To deliver reset links by email, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `CLIENT_ORIGIN` in `server/.env`.

## Features

- Account registration, login, and current-user endpoint
- User-scoped deck and flashcard create, edit, browse, and delete
- Dashboard totals, cards due today, mastered count, and recent decks
- Study all due cards or cards due in one deck, one at a time
- Easy advances one box with 2, 4, 8, or 16 day intervals
- Hard resets to box 1 and schedules another review in 10 minutes
- Dashboard progress and per-deck progress summaries

## Checks

```powershell
cd server
npm test
```

```powershell
cd client
npm run build
```

The API health check is `GET /api/health`.
