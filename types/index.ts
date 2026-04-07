// ============================================================
// Hoops GM — Shared TypeScript Types
// ============================================================

// ---- Enums / Unions ----

export type SlotType = 'starter' | 'sixth_man' | 'rotation' | 'bench' | 'ir';

export type AcquiredVia = 'draft' | 'free_agent' | 'trade';

export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export type TradeAssetType = 'player' | 'pick';

export type PickProtection = 'none' | 'top_n' | 'lottery';

export type CapZone = 'compliant' | 'tax' | 'lockout';

// ---- Database Row Types ----

export interface League {
  id: string;
  name: string;
  commissioner_id: string;
  season: number;
  cap_limit: number;
  created_at: string;
}

export interface Team {
  id: string;
  league_id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Player {
  id: string;
  balldontlie_id: number;
  full_name: string;
  position: string;
  tier: number;
  salary: number;
  is_rookie: boolean;
  games_played: number;
  per36_pts: number;
  per36_reb: number;
  per36_ast: number;
  per36_stl: number;
  per36_blk: number;
  per36_to: number;
  per36_fg3m: number;
  per36_fgmiss: number;
}

export interface RosterSlot {
  id: string;
  team_id: string;
  player_id: string;
  season: number;
  slot_type: SlotType;
  slot_position: number;
  acquired_via: AcquiredVia;
  draft_ceiling_active: boolean;
  contract_salary: number;
  retained_seasons: number;
}

export interface WeeklyLineup {
  id: string;
  team_id: string;
  week: number;
  season: number;
  roster_slot_id: string;
  predicted_minutes: number;
}

export interface ScoringLog {
  id: string;
  team_id: string;
  week: number;
  season: number;
  roster_slot_id: string;
  player_id: string;
  actual_minutes: number;
  raw_score: number;
  coaching_bonus: number;
  simulation_used: boolean;
  breakout: boolean;
  final_score: number;
}

export interface DraftPick {
  id: string;
  league_id: string;
  season: number;
  round: number;
  original_team_id: string;
  current_owner_id: string;
  protection_type: PickProtection;
  protection_value: number;
  conveyed: boolean;
}

export interface Trade {
  id: string;
  league_id: string;
  status: TradeStatus;
  proposed_by_team_id: string;
  created_at: string;
}

export interface TradeAsset {
  id: string;
  trade_id: string;
  from_team_id: string;
  to_team_id: string;
  asset_type: TradeAssetType;
  player_id: string | null;
  draft_pick_id: string | null;
}

// ---- Scoring Types ----

export interface PlayerGameStats {
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  to: number;
  fg3m: number;
  fgMissed: number;
  pf: number;
  tf: number;
  ff: number;
  min: number;
  dreb: number;
  oreb: number;
}

export interface ScoringBreakdown {
  scoring: number;
  playmaking: number;
  defense: number;
  boards: number;
  bonuses: number;
  penalties: number;
}

export interface ScoringResult {
  rawScore: number;
  coachingBonus: number;
  simulationUsed: boolean;
  breakout: boolean;
  finalScore: number;
  breakdown: ScoringBreakdown;
}

export interface Milestones {
  doubleDouble: boolean;
  tripleDouble: boolean;
  assists15: boolean;
  rebounds20: boolean;
}

export interface Per36Stats {
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  to: number;
  fg3m: number;
  fgmiss: number;
}

// ---- BallDontLie API Response Types ----

export interface BDLPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  team: {
    id: number;
    abbreviation: string;
    full_name: string;
  };
}

export interface BDLSeasonAverage {
  player_id: number;
  season: number;
  games_played: number;
  min: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  fg3m: number;
  fga: number;
  fgm: number;
  dreb: number;
  oreb: number;
  pf: number;
}

export interface BDLGameStats {
  id: number;
  player: BDLPlayer;
  game: { id: number };
  min: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  fg3m: number;
  fga: number;
  fgm: number;
  dreb: number;
  oreb: number;
  pf: number;
}

export interface BDLPaginatedResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    next_cursor: number | null;
    per_page: number;
  };
}
