export interface LeaderboardRow {
  position: number;
  userId: string;
  username: string;
  pointsTotal: number;
  profilePicUrl?: string;
  trend?: 'up' | 'down' | 'same';
}

export interface LeaderboardResponse {
  rows: LeaderboardRow[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  me?: LeaderboardRow;
}

export interface LeaderboardFilters {
  phase: 'group' | 'playoffs';
  page?: number;
  size?: number;
  search?: string;
}

export interface UserTeam {
  userId: string;
  username: string;
  profilePicUrl?: string;
  phase: 'group' | 'playoffs';
  players: Array<{
    id: number;
    nickname: string;
    role?: string;
    imageUrl?: string;
    totalPoints: number;
    Team?: {
      id: number;
      name: string;
      logoUrl: string;
    };
  }>;
  pointsTotal: number;
  createdAt: string;
}

export interface LeaderboardTab {
  id: 'global' | 'my-league';
  name: string;
  enabled: boolean;
  badge?: string;
}

export type LeaderboardType = 'global' | 'my-league';