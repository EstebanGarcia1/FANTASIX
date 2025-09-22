// src/entities/matches/types.ts

export interface Team {
  id: number;
  name: string;
  logoUrl?: string;
  region?: string;
}

export interface Tournament {
  id: number;
  name: string;
  slug?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface Match {
  id: number;
  date: string;
  format: 'BO1' | 'BO3' | 'BO5';
  round: string;
  phase: string;
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled';
  scoreA: number;
  scoreB: number;
  mapScores: string[];
  teamA: Team;
  teamB: Team;
  tournament?: Tournament;
  externalUrl?: string;
  streamUrl?: string;
}

export interface MatchFilters {
  scope?: 'upcoming' | 'recent' | 'live';
  tournamentId?: number;
  teamId?: number;
  round?: string;
  page?: number;
  size?: number;
}

export interface MatchesResponse {
  matches: Match[];
  page: number;
  size: number;
  total: number;
  hasMore: boolean;
}

// Bracket types
export interface BracketMatch {
  id: number;
  teamA?: Team;
  teamB?: Team;
  scoreA?: number;
  scoreB?: number;
  status: Match['status'];
  scheduledTime?: string;
}

export interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

export interface Bracket {
  tournamentId: number;
  rounds: BracketRound[];
  lastUpdated: string;
}

// UI State types
export type MatchTab = 'upcoming' | 'recent';

export interface UserTeamHighlight {
  hasPlayers: boolean;
  teamNames: string[];
  playerCount: number;
}

// Utility types
export interface MatchCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

export interface MatchTime {
  formatted: string;
  relative: string;
  countdown?: MatchCountdown;
}