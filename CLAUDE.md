# Hoops GM — Development Guide

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript strict check
- `npm test` — run Jest tests
- `npm run test:watch` — run tests in watch mode

## Project Structure

```
/app              — Next.js App Router pages
/app/api          — API routes (scoring, roster, draft, trades, lineup, auth)
/components       — React components (CapBar, RosterSlot, PlayerCard, ScoringBreakdown, Nav)
/lib              — Shared logic (scoring, salary, simulation, balldontlie, firebase)
/supabase         — DB schema reference (Firestore collections mirror this structure)
/types            — Shared TypeScript types
/__tests__        — Unit tests (scoring, salary)
```

## Code Style

- TypeScript strict mode — no `any` types
- Functional React components with hooks
- Server components by default, `'use client'` only when needed
- All scoring/salary logic lives in `/lib` — never inline in components
- Validate BallDontLie API responses before using (can return nulls)

## Key Domain Rules

- $20 active cap across 8 active + 2 bench players (IR excluded from cap)
- Salaries move ±$0.50/season at tier boundaries; drafted players capped at $4
- 6th man: 20-min simulation, 15-min floor, 25-min breakout
- Rotation: 10-min simulation, 8-min floor, 20-min breakout
- Per-36 eligibility requires 20+ games played
- Scoring mirrors Sleeper settings + coaching accuracy bonus

## Auth & Database

- **Auth**: Firebase Auth (email/password) with server-side session cookies
- **Database**: Firebase Firestore
- **Admin SDK**: Used in API routes for server-side operations
- Middleware checks session cookie; redirects unauthenticated users to /login

## Testing

- Unit test all scoring and salary logic in `/lib`
- Run `npm test` before committing changes to `/lib`
- Tests live in `/__tests__/`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `BALLDONTLIE_API_KEY` — BallDontLie API key
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config (from Firebase Console > Project Settings)
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` — Firebase Admin SDK service account
