<div align="center">

# MindMate 🌱

A full-stack student wellness companion app that combines mood tracking, guided breathing/grounding exercises, and an empathetic AI chat companion built on Google Gemini.

</div>

## Features

- **Mood check-ins** — track mood, stress level, anxiety score, and sleep quality, with history and streaks
- **AI companion chat** — a warm, casual, friend-like Gemini-powered chat that adapts its tone based on your emotional state, grounded in CBT, Stoic, and Nonviolent Communication principles
- **Breathing, grounding & movement tools** — guided breathing timer, 5-4-3-2-1 grounding exercise, and desk-friendly tension-release stretches, with the AI able to deep-link directly into the relevant tab
- **Daily insight** — a short AI-generated wellness reflection on the home screen
- **Auth** — email/password (bcrypt hashed) and Google/Facebook sign-in
- **Persistent history** — mood entries and chat history stored per-user in SQLite

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router v7, Tailwind CSS, Framer Motion, Recharts |
| Backend | Express, TypeScript (tsx), better-sqlite3 |
| AI | Google Gemini (`@google/genai`) |
| Auth | bcrypt + signed session tokens, Google/Facebook OAuth verification |
| Security | Helmet, CORS allowlist, express-rate-limit |

## Getting started

**Prerequisites:** Node.js 22+

1. Install dependencies
   ```bash
   npm install
   ```

2. Copy the example env file and fill in your values
   ```bash
   cp .env.example .env
   ```

3. Set the required environment variables in `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=a_long_random_secret              # required in production
   VITE_GOOGLE_CLIENT_ID=your_google_client_id  # optional, for Google sign-in
   VITE_FACEBOOK_APP_ID=your_facebook_app_id    # optional, for Facebook sign-in
   FRONTEND_URL=http://localhost:5173
   DATABASE_PATH=./mindmate.db
   ```

4. Run the app in development
   ```bash
   npm run dev
   ```
   This starts the Express server (with Vite middleware) on `http://localhost:3000`.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Express + Vite middleware) |
| `npm run build` | Build frontend (Vite) and bundle the server for production |
| `npm start` | Run the production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm test` | Run unit tests with Vitest |
| `npm run clean` | Remove the `dist` directory |

## Project structure

```
src/
├── components/
│   ├── screens/        # Top-level screens (Home, Chat, Breathe, CheckIn, History, Profile, ...)
│   ├── BottomNav.tsx
│   ├── TopBar.tsx
│   └── ErrorBoundary.tsx
├── context/             # User, Entries, Theme, Toast contexts
├── hooks/               # Custom hooks (e.g. useDailyInsight)
├── services/            # API client (geminiService.ts)
├── utils/               # Stats helpers (streaks, etc.)
└── types.ts             # Shared TypeScript types

server.ts                # Express API server (auth, mood entries, chat, daily insight)
```

## API overview

All authenticated routes require a `Bearer` token from `/api/auth/token`.

| Route | Method | Description |
|---|---|---|
| `/api/auth/token` | POST | Email/password sign in or registration |
| `/api/auth/google` | POST | Google sign-in |
| `/api/auth/facebook` | POST | Facebook sign-in |
| `/api/auth/refresh` | POST | Refresh session token |
| `/api/auth/reset-request` | POST | Request a password reset |
| `/api/auth/reset-confirm` | POST | Confirm password reset with token |
| `/api/user/profile` | GET / POST | Get or update profile |
| `/api/user/account` | DELETE | Delete account and all data |
| `/api/entries` | GET / POST | Mood entries CRUD |
| `/api/entries/:id` | DELETE | Delete a single entry |
| `/api/entries/all` | DELETE | Clear all entries |
| `/api/chat` | POST | Send a message to the AI companion |
| `/api/chat/history` | GET | Fetch recent chat history |
| `/api/chat/save` | POST | Persist a chat message |
| `/api/daily-insight` | GET | Get a short AI wellness insight |
| `/health` | GET | Health check (DB connectivity) |

## AI companion architecture

Every chat message goes through a 4-step pipeline:

1. **Context capture** — the frontend bundles the user's message with their live state: name, latest mood/stress/anxiety scores, and any reported physical (somatic) indicators.
2. **Whisper injection** — the Express backend prepends this state as a silent context note and attaches the system instruction (tone rules + behavioral framework) before calling Gemini.
3. **Processing** — Gemini generates a response shaped by the user's current emotional state, not just the literal text.
4. **UI routing** — the AI can return special markdown links (`[Breathing Space](/breathe)`, `[Grounding Movement](/breathe?tab=ground)`, `[Movement Break](/breathe?tab=move)`) which the frontend renders as clickable buttons that deep-link into the relevant exercise tab.

## Security notes

- Passwords are hashed with bcrypt
- Auth and chat routes are rate-limited
- CORS is restricted via an origin allowlist (configurable per environment)
- `JWT_SECRET` is required and validated at startup in production

## Roadmap

- [ ] Migrate session token from localStorage to httpOnly cookies
- [ ] Add transactional email delivery for password reset
- [ ] Add CSRF protection
- [ ] Server-side streak computation
- [ ] Offline mode for check-ins
- [ ] Migrate to Postgres/Turso for multi-instance deployments

## License

This project was built as a student capstone project. All rights reserved unless otherwise noted.
