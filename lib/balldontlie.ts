import type { BDLPlayer, BDLSeasonAverage, BDLGameStats, BDLPaginatedResponse } from '@/types';

const BASE_URL = 'https://api.balldontlie.io/v1';

const getApiKey = (): string => {
  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) throw new Error('BALLDONTLIE_API_KEY is not set');
  return key;
};

const headers = (): HeadersInit => ({
  Authorization: `Bearer ${getApiKey()}`,
  'Content-Type': 'application/json',
});

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`BallDontLie API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
};

// Search/list players
export const getPlayers = async (
  search?: string,
  cursor?: number,
  perPage = 25
): Promise<BDLPaginatedResponse<BDLPlayer>> => {
  const params = new URLSearchParams({ per_page: String(perPage) });
  if (search) params.set('search', search);
  if (cursor) params.set('cursor', String(cursor));
  return fetchJson(`${BASE_URL}/players?${params}`);
};

// Get season averages for one or more players
export const getSeasonAverages = async (
  season: number,
  playerIds: number[]
): Promise<{ data: BDLSeasonAverage[] }> => {
  const params = new URLSearchParams({ season: String(season) });
  playerIds.forEach((id) => params.append('player_ids[]', String(id)));
  return fetchJson(`${BASE_URL}/season_averages?${params}`);
};

// Get game stats (box scores) for specific game IDs
export const getGameStats = async (
  gameIds: number[]
): Promise<BDLPaginatedResponse<BDLGameStats>> => {
  const params = new URLSearchParams();
  gameIds.forEach((id) => params.append('game_ids[]', String(id)));
  return fetchJson(`${BASE_URL}/stats?${params}`);
};

// Get games for a season and optional team
export const getGames = async (
  season: number,
  teamIds?: number[],
  cursor?: number,
  perPage = 25
): Promise<BDLPaginatedResponse<{ id: number; date: string; home_team: { id: number }; visitor_team: { id: number } }>> => {
  const params = new URLSearchParams({
    per_page: String(perPage),
  });
  params.append('seasons[]', String(season));
  if (teamIds) {
    teamIds.forEach((id) => params.append('team_ids[]', String(id)));
  }
  if (cursor) params.set('cursor', String(cursor));
  return fetchJson(`${BASE_URL}/games?${params}`);
};

// Calculate per-36 stat from per-game average
export const calcPer36 = (statPerGame: number, minPerGame: number): number =>
  minPerGame > 0 ? (statPerGame / minPerGame) * 36 : 0;

// Parse minutes string (e.g. "32:15") to number
export const parseMinutes = (minStr: string | null | undefined): number => {
  if (!minStr) return 0;
  const parts = minStr.split(':');
  const mins = parseInt(parts[0], 10);
  return isNaN(mins) ? 0 : mins;
};
