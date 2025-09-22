// Base entities aligned with backend schema

export interface Team {
  id: number;
  name: string;
  logoUrl: string;
  region?: string;
}

export interface Player {
  id: number;
  nickname: string;
  role?: 'Entry' | 'Flex' | 'Support';
  imageUrl?: string;
  region?: string;
  totalPoints: number;
  teamId?: number;
  Team?: Team;
}

export interface Tournament {
  id: number;
  name: string;
  slug?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  teams: Team[];
}

export interface Match {
  id: number;
  date: string;
  format: string;
  round: string;
  scoreA: number;
  scoreB: number;
  mapScores: string[];
  teamA: Team;
  teamB: Team;
  tournament?: Tournament;
}

export interface FantasyPick {
  id: number;
  position: number;
  player: Player;
}

export interface FantasyTeam {
  id: number;
  phase: 'group' | 'playoffs';
  totalPoints: number;
  createdAt: string;
  picks: FantasyPick[];
}

export interface GlobalConfig {
  id: number;
  draftGruposOpen: boolean;
  draftPlayoffsOpen: boolean;
  redraftOpensAt?: string;
}

export interface LeaderboardEntry {
  user: {
    username: string;
    profilePicUrl?: string;
  };
  phase: 'group' | 'playoffs';
  totalPoints: number;
}

// API Response types
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Fantasy Draft types
export type FantasyPhase = 'group' | 'playoffs';

export interface DraftValidation {
  isValid: boolean;
  errors: string[];
}

// Player filters
export interface PlayerFilters {
  role?: Player['role'];
  teamId?: number;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Match filters  
export interface MatchFilters {
  scope?: 'upcoming' | 'recent' | 'live';
  tournamentId?: number;
  teamId?: number;
  round?: string;
}