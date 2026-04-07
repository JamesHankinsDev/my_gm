# Hoops GM — Development Guide

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript strict check
- `npm test` — run Jest tests
- `npm run test:watch` — run tests in watch mode
- `npx supabase db push` — push schema migrations

## Project Structure

```
/app              — Next.js App Router pages
/app/api          — API routes (scoring, roster, draft, trades, lineup)
/components       — React components (CapBar, RosterSlot, PlayerCard, ScoringBreakdown)
/lib              — Shared logic (scoring, salary, simulation, balldontlie, supabase)
/supabase         — DB schema and migrations
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

## Testing

- Unit test all scoring and salary logic in `/lib`
- Run `npm test` before committing changes to `/lib`
- Tests live in `/__tests__/`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `BALLDONTLIE_API_KEY` — BallDontLie API key
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
