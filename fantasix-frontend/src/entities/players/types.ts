import type { Team } from '../types';

export interface PlayerStats {
  totalPoints: number;
  gamesPlayed: number;
  averagePointsPerGame: number;
  pointsByRival: Array<{
    rivalTeam: Team;
    points: number;
    date: string;
    matchId: number;
  }>;
  currentPhasePoints: number;
  groupPhasePoints: number;
  playoffsPoints: number;
}

export interface PlayerDetailed {
  id: number;
  nickname: string;
  realName?: string;
  role: 'Entry' | 'Flex' | 'Support';
  imageUrl?: string;
  region: string;
  teamId: number;
  Team: Team;
  stats: PlayerStats;
  isActive: boolean;
  joinedAt: string;
  socialLinks?: {
    twitter?: string;
    twitch?: string;
    instagram?: string;
  };
}

export interface NextMatch {
  id: number;
  date: string;
  rivalTeam: Team;
  tournament: {
    id: number;
    name: string;
  };
  round: string;
  format: string;
  isHome: boolean;
}

export interface PlayerFilters {
  role?: 'Entry' | 'Flex' | 'Support';
  teamId?: number;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'points' | 'name' | 'team';
  sortOrder?: 'asc' | 'desc';
}

export interface PlayersResponse {
  players: PlayerDetailed[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// API Response types
export interface PlayerApiResponse {
  id: number;
  nickname: string;
  realName?: string;
  role: string;
  imageUrl?: string;
  region: string;
  teamId: number;
  Team: {
    id: number;
    name: string;
    logoUrl: string;
    region: string;
  };
  isActive: boolean;
  joinedAt: string;
  socialLinks?: {
    twitter?: string;
    twitch?: string;
    instagram?: string;
  };
  stats: {
    totalPoints: number;
    gamesPlayed: number;
    averagePointsPerGame: number;
    currentPhasePoints: number;
    groupPhasePoints: number;
    playoffsPoints: number;
    pointsByRival: Array<{
      rivalTeam: {
        id: number;
        name: string;
        logoUrl: string;
        region: string;
      };
      points: number;
      date: string;
      matchId: number;
    }>;
  };
}

export interface PlayersApiResponse {
  players: PlayerApiResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface NextMatchApiResponse {
  id: number;
  date: string;
  teamA: {
    id: number;
    name: string;
    logoUrl: string;
  };
  teamB: {
    id: number;
    name: string;
    logoUrl: string;
  };
  tournament: {
    id: number;
    name: string;
  };
  round: string;
  format: string;
}

// View modes for player catalog
export type PlayerViewMode = 'grid' | 'table';

// Draft integration types
export interface PlayerDraftAction {
  playerId: number;
  action: 'add' | 'remove';
  player: PlayerDetailed;
}

export interface PlayerCardProps {
  player: PlayerDetailed;
  viewMode: PlayerViewMode;
  isDraftOpen: boolean;
  isSelected?: boolean;
  canSelect?: boolean;
  onDraftAction?: (action: PlayerDraftAction) => void;
  disabled?: boolean;
}