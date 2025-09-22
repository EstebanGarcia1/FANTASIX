import { useQuery, useQueryClient } from '@tanstack/react-query';
import httpClient from '../../../shared/api/http';
import type { LeaderboardResponse, LeaderboardFilters, UserTeam } from '../../../entities/leaderboard/types';
import type { FantasyPhase } from '../../../entities/types';

// Query Keys
const leaderboardKeys = {
  all: ['leaderboard'] as const,
  lists: () => [...leaderboardKeys.all, 'list'] as const,
  list: (filters: LeaderboardFilters) => [...leaderboardKeys.lists(), filters] as const,
  userTeam: (userId: string, phase: FantasyPhase) => ['userTeam', userId, phase] as const,
};

/**
 * Hook para obtener el leaderboard con filtros y paginación
 */
export function useLeaderboard(filters: LeaderboardFilters) {
  return useQuery({
    queryKey: leaderboardKeys.list(filters),
    queryFn: async (): Promise<LeaderboardResponse> => {
      const params = new URLSearchParams();
      
      params.append('phase', filters.phase);
      params.append('page', (filters.page || 1).toString());
      params.append('size', (filters.size || 50).toString());
      
      if (filters.search?.trim()) {
        params.append('q', filters.search.trim());
      }

      const response = await httpClient.get<{
        leaderboard: Array<{
          user: { username: string; profilePicUrl?: string };
          phase: string;
          totalPoints: number;
        }>;
        page: number;
        limit: number;
        total: number;
      }>(`/fantasy/leaderboard?${params.toString()}`, false);

      // Transform backend data to our format
      const rows = response.leaderboard.map((entry, index) => ({
        position: ((filters.page || 1) - 1) * (filters.size || 50) + index + 1,
        userId: `user-${index}`, // Backend should provide real userId
        username: entry.user.username,
        pointsTotal: entry.totalPoints,
        profilePicUrl: entry.user.profilePicUrl,
        trend: undefined as 'up' | 'down' | 'same' | undefined, // Backend should provide trend
      }));

      const totalPages = Math.ceil(response.total / response.limit);

      return {
        rows,
        page: response.page,
        size: response.limit,
        total: response.total,
        totalPages,
        hasMore: response.page < totalPages,
        me: undefined, // TODO: Backend should include current user position
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true, // Keep previous data while loading new page
    select: (data) => {
      // Additional client-side processing if needed
      return data;
    },
  });
}

/**
 * Hook para obtener el equipo de un usuario específico
 */
export function useUserTeam(userId: string, phase: FantasyPhase, enabled = true) {
  const isFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_VIEW_TEAMS === 'true';
  
  return useQuery({
    queryKey: leaderboardKeys.userTeam(userId, phase),
    queryFn: async (): Promise<UserTeam> => {
      if (!isFeatureEnabled) {
        // Mock data for development
        return {
          userId,
          username: 'Usuario Mock',
          phase,
          players: [
            {
              id: 1,
              nickname: 'MockPlayer1',
              role: 'Entry',
              totalPoints: 125,
              Team: { id: 1, name: 'Mock Team', logoUrl: 'mock-logo.png' }
            },
            {
              id: 2,
              nickname: 'MockPlayer2',
              role: 'Flex',
              totalPoints: 110,
              Team: { id: 2, name: 'Mock Team 2', logoUrl: 'mock-logo2.png' }
            },
            {
              id: 3,
              nickname: 'MockPlayer3',
              role: 'Support',
              totalPoints: 95,
              Team: { id: 1, name: 'Mock Team', logoUrl: 'mock-logo.png' }
            },
            {
              id: 4,
              nickname: 'MockPlayer4',
              role: 'Entry',
              totalPoints: 88,
              Team: { id: 3, name: 'Mock Team 3', logoUrl: 'mock-logo3.png' }
            },
            {
              id: 5,
              nickname: 'MockPlayer5',
              role: 'Flex',
              totalPoints: 102,
              Team: { id: 2, name: 'Mock Team 2', logoUrl: 'mock-logo2.png' }
            },
          ],
          pointsTotal: 520,
          createdAt: new Date().toISOString(),
        };
      }

      // Real API call (when available)
      const response = await httpClient.get<{ team: UserTeam }>(
        `/fantasy/team/${userId}?phase=${phase}`
      );
      
      return response.team;
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if endpoint doesn't exist yet
  });
}

/**
 * Hook para buscar la posición del usuario actual
 */
export function useMyPosition(phase: FantasyPhase) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['myPosition', phase],
    queryFn: async () => {
      // First try to get from any cached leaderboard data
      const cachedData = queryClient.getQueriesData<LeaderboardResponse>({
        queryKey: leaderboardKeys.lists(),
      });
      
      for (const [key, data] of cachedData) {
        if (data?.me && key.includes(phase)) {
          return data.me;
        }
      }
      
      // If not in cache, make specific request
      const response = await httpClient.get<{ user: any }>('/fantasy/me?phase=' + phase);
      
      // This would need to be adapted based on actual backend response
      return {
        position: 1, // Backend should provide actual position
        userId: 'me',
        username: response.user.username || 'Me',
        pointsTotal: 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: false, // Only run when explicitly triggered
  });
}

/**
 * Utility para calcular en qué página está una posición específica
 */
export function calculatePageForPosition(position: number, pageSize: number): number {
  return Math.ceil(position / pageSize);
}

/**
 * Hook para navegar a la posición del usuario
 */
export function useJumpToMyPosition() {
  const queryClient = useQueryClient();
  
  return {
    jumpToPosition: async (position: number, phase: FantasyPhase, pageSize: number = 50) => {
      const targetPage = calculatePageForPosition(position, pageSize);
      
      // Prefetch the target page
      await queryClient.prefetchQuery({
        queryKey: leaderboardKeys.list({ phase, page: targetPage, size: pageSize }),
      });
      
      return targetPage;
    },
  };
}