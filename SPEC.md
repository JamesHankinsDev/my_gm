# Hoops GM — Full Product Specification

## Overview

Hoops GM is a fantasy basketball league platform that rewards front office thinking over stat accumulation. Owners manage salary caps, coach minute assignments, build through the draft, and negotiate multi-team trades.

## Phase 1 — Foundation

### 1.1 Database Schema

See `supabase/migrations/00001_initial_schema.sql` for the full schema.

Key tables:
- **leagues** — League configuration and commissioner
- **teams** — One per user per league
- **players** — Synced from BallDontLie API with per-36 stats and tier/salary
- **roster_slots** — Player assignments to team slots (starter, 6th man, rotation, bench, IR)
- **weekly_lineups** — Coaching decisions (predicted minutes for 6th man/rotation)
- **scoring_logs** — Per-player per-week scoring results
- **draft_picks** — Multi-year picks with protections
- **trades / trade_assets** — Multi-team trade proposals
- **player_drop_log** — Drop & re-sign salary tracking

### 1.2 BallDontLie API Integration

Base URL: `https://api.balldontlie.io/v1`
Auth: `Authorization: Bearer {BALLDONTLIE_API_KEY}` header

Key endpoints:
- `GET /players` — player search and listing
- `GET /season_averages?season=2025&player_ids[]={}` — per-game averages
- `GET /games?seasons[]=2025&team_ids[]={}` — game schedule
- `GET /stats?game_ids[]={}` — box scores for scoring engine

Per-36 calculation:
```typescript
const per36 = (statPerGame: number, minPerGame: number) =>
  minPerGame > 0 ? (statPerGame / minPerGame) * 36 : 0;
```

Tier assignment (end of season / free agents):
```typescript
const assignTier = (fantasyPPG: number): number => {
  if (fantasyPPG >= 42) return 5;  // ~30+ pts + elite peripherals
  if (fantasyPPG >= 32) return 4;
  if (fantasyPPG >= 22) return 3;
  if (fantasyPPG >= 14) return 2;
  return 1;
};
```

Minimum games for per-36 eligibility: **20 games played** in current season.

### 1.3 Scoring Engine

See `/lib/scoring.ts` for full implementation.

**Slot scoring logic:**

| Slot | Scoring Rule |
|------|-------------|
| **Starter** (1-5) | Always score actual stats, milestones apply, DNP = 0 |
| **6th Man** (6) | <15 min → 0, ≥25 min → actual (breakout), else → simulate to 20 min |
| **Rotation** (7-8) | <8 min → 0, ≥20 min → actual (breakout), else → simulate to 10 min |
| **Bench** (9-10) | Always 0 |
| **IR** (IR1-2) | Always 0, salary suspended |

**Coaching bonus** (6th man & rotation only):
- Predicted = Actual (±2 min): +2.0
- Within 5 min: +1.0
- Within 10 min: 0.0
- Over 10 min off: -1.0
- Correct DNP call: +2.0
- Wrong DNP call: -3.0

### 1.4 Salary Engine

See `/lib/salary.ts` for full implementation.

- **Active cap**: $20 across 8 active + 2 bench slots (IR excluded)
- **Season-end adjustment**: ±$0.50 when tier boundary crossed
- **Drafted player ceiling**: $4.00 max
- **Salary range**: $1.00 – $5.00
- **Tax zone** ($20–$22): 5% scoring penalty per dollar over
- **Lockout** (>$22): 0 points scored

## Phase 2 — Core UI

Pages:
- `/` — League dashboard
- `/roster` — Roster management
- `/lineup` — Weekly lineup + coaching
- `/scoring` — Scoring breakdown
- `/league/draft` — Draft board
- `/league/trades` — Trade hub
- `/league/standings` — Standings
- `/players` — Free agent marketplace
- `/admin` — Commissioner tools

## Phase 3 — Draft & Trade Systems

**Draft lottery** (end of regular season):
- Non-playoff teams enter consolation bracket
- Lottery ball allocation: winner=25, 3rd-4th=18, 5th=14, loser=10
- Playoff teams pick 6-10 (champion picks last)

**Multi-team trades**:
- Up to 4 teams per trade
- Commissioner 24-hour veto window
- Salary matching: outgoing ≤ 125% of incoming + $0.50
- Max 5 years future picks; no 2 consecutive future 1sts traded away

**Drop & re-sign rule**:
- Same team, same season → pre-drop salary
- Any other team → current market tier salary

## Phase 4 — Scoring Automation

Weekly scoring job:
1. Fetch games from BallDontLie
2. Fetch box scores for each game
3. Match players to lineup, apply slot scoring
4. Calculate coaching bonus
5. Apply cap penalty
6. Store in scoring_logs, update standings

Season-end tier recalculation:
1. Fetch full season averages
2. Calculate fantasy PPG
3. Assign new tiers
4. Apply ±$0.50 salary adjustments
5. Flag teams over cap

## Environment Variables

```
BALLDONTLIE_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Build Order

1. Supabase schema + migrations
2. BallDontLie API client
3. Scoring engine + unit tests
4. Salary engine + unit tests
5. API routes: roster CRUD, lineup save, scoring trigger
6. Roster page UI
7. Lineup / coaching page UI
8. Scoring breakdown page UI
9. Player marketplace / free agent page
10. Draft system + lottery
11. Trade builder
12. Commissioner admin tools
13. Weekly scoring automation
14. Season-end tier recalculation job
