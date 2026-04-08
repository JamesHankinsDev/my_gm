# Hoops GM — Fantasy Basketball League

A full-stack fantasy basketball web app with salary cap management, per-36 minute simulation, Bird Rights contracts, multi-year draft picks, and anti-tanking draft lottery. Built on the BallDontLie API.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (email/password, session cookies)
- **Data**: BallDontLie API (NBA stats, player data, game logs)
- **Payments**: Stripe (future — per-league subscriptions)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env and fill in your keys
cp .env.example .env.local

# Run dev server
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run tests |

## Project Structure

```
/app              — Next.js App Router pages
/app/api          — API routes (scoring, roster, draft, trades, auth)
/components       — React components
/lib              — Shared logic (scoring, salary, simulation, firebase)
/types            — Shared TypeScript types
/__tests__        — Unit tests
```

## Key Features

- **Salary Cap**: $20 active cap with tax/lockout zones
- **Per-36 Simulation**: 6th man and rotation slots use projected stats
- **Coaching Bonus**: Predict minutes for accuracy points
- **Draft Lottery**: Anti-tanking consolation bracket system
- **Multi-Team Trades**: Up to 4 teams with salary matching rules
- **Bird Rights**: Retained player contract advantages

See [SPEC.md](SPEC.md) for the full product specification.
