-- Hoops GM — Initial Database Schema
-- Run with: npx supabase db push

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- Leagues
-- ============================================================
create table leagues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  commissioner_id uuid not null,
  season int not null default 2025,
  cap_limit numeric(3,1) not null default 20.0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Teams (one per user per league)
-- ============================================================
create table teams (
  id uuid primary key default uuid_generate_v4(),
  league_id uuid not null references leagues(id) on delete cascade,
  user_id uuid not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (league_id, user_id)
);

-- ============================================================
-- Players (synced from BallDontLie API)
-- ============================================================
create table players (
  id uuid primary key default uuid_generate_v4(),
  balldontlie_id int unique not null,
  full_name text not null,
  position text not null default '',
  tier int not null default 1 check (tier between 1 and 5),
  salary numeric(3,1) not null default 1.0,
  is_rookie boolean not null default false,
  games_played int not null default 0,
  per36_pts numeric(6,2) not null default 0,
  per36_reb numeric(6,2) not null default 0,
  per36_ast numeric(6,2) not null default 0,
  per36_stl numeric(6,2) not null default 0,
  per36_blk numeric(6,2) not null default 0,
  per36_to numeric(6,2) not null default 0,
  per36_fg3m numeric(6,2) not null default 0,
  per36_fgmiss numeric(6,2) not null default 0
);

-- ============================================================
-- Roster slots
-- ============================================================
create type slot_type as enum ('starter', 'sixth_man', 'rotation', 'bench', 'ir');
create type acquired_via as enum ('draft', 'free_agent', 'trade');

create table roster_slots (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid not null references players(id),
  season int not null,
  slot_type slot_type not null,
  slot_position int not null,
  acquired_via acquired_via not null default 'free_agent',
  draft_ceiling_active boolean not null default false,
  contract_salary numeric(3,1) not null default 1.0,
  retained_seasons int not null default 1,
  unique (team_id, season, slot_position)
);

-- ============================================================
-- Weekly lineups (coaching decisions)
-- ============================================================
create table weekly_lineups (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  week int not null,
  season int not null,
  roster_slot_id uuid not null references roster_slots(id),
  predicted_minutes int not null default 0,
  unique (team_id, week, season, roster_slot_id)
);

-- ============================================================
-- Scoring logs
-- ============================================================
create table scoring_logs (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  week int not null,
  season int not null,
  roster_slot_id uuid not null references roster_slots(id),
  player_id uuid not null references players(id),
  actual_minutes int not null default 0,
  raw_score numeric(6,2) not null default 0,
  coaching_bonus numeric(4,2) not null default 0,
  simulation_used boolean not null default false,
  breakout boolean not null default false,
  final_score numeric(6,2) not null default 0
);

-- ============================================================
-- Draft picks
-- ============================================================
create type pick_protection as enum ('none', 'top_n', 'lottery');

create table draft_picks (
  id uuid primary key default uuid_generate_v4(),
  league_id uuid not null references leagues(id) on delete cascade,
  season int not null,
  round int not null,
  original_team_id uuid not null references teams(id),
  current_owner_id uuid not null references teams(id),
  protection_type pick_protection not null default 'none',
  protection_value int not null default 0,
  conveyed boolean not null default false
);

-- ============================================================
-- Trades
-- ============================================================
create type trade_status as enum ('pending', 'accepted', 'rejected', 'expired');
create type trade_asset_type as enum ('player', 'pick');

create table trades (
  id uuid primary key default uuid_generate_v4(),
  league_id uuid not null references leagues(id) on delete cascade,
  status trade_status not null default 'pending',
  proposed_by_team_id uuid not null references teams(id),
  created_at timestamptz not null default now()
);

create table trade_assets (
  id uuid primary key default uuid_generate_v4(),
  trade_id uuid not null references trades(id) on delete cascade,
  from_team_id uuid not null references teams(id),
  to_team_id uuid not null references teams(id),
  asset_type trade_asset_type not null,
  player_id uuid references players(id),
  draft_pick_id uuid references draft_picks(id)
);

-- ============================================================
-- Drop & re-sign tracking
-- ============================================================
create table player_drop_log (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id),
  dropped_by_team_id uuid not null references teams(id),
  dropped_season int not null,
  pre_drop_salary numeric(3,1) not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_roster_slots_team on roster_slots(team_id, season);
create index idx_scoring_logs_team_week on scoring_logs(team_id, week, season);
create index idx_players_bdl_id on players(balldontlie_id);
create index idx_draft_picks_league on draft_picks(league_id, season);
create index idx_trades_league on trades(league_id);
