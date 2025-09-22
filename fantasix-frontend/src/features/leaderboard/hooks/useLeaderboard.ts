import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import httpClient from '../../../shared/api/http';
import type { 
  LeaderboardResponse, 
  LeaderboardFilters, 
  LeaderboardApiResponse,
  UserTeam,
  UserTeamApiResponse
} from '../../../entities/leaderboard/types';
import type { FantasyPhase } from '../../../entities/types';

// Query Keys
const leaderboardKeys = {
  all: ['leaderboard'] as const,
  lists: () => [...leaderboardKeys.all, 'list'] as const,
  list: (filters: LeaderboardFilters) => [...leaderboardKeys.lists(), filters] as const,
  userTeam: (userId: string, phase: FantasyPhase) => ['userTeam', userId, phase] as const,
  myPosition: (phase: FantasyPhase) => ['myPosition', phase] as const,
};

/**
 * Transforms backend API response to frontend format
 */
function transformLeaderboardResponse(
  apiResponse: LeaderboardApiResponse,
  filters: LeaderboardFilters
): LeaderboardResponse {
  const startPosition = ((filters.page || 1) - 1) * (filters.size || 50);
  
  const rows = apiResponse.leaderboard.map((entry, index) => ({
    position: startPosition + index + 1,
    userId: `user-${startPosition + index}`, // Backend should provide real userId
    username: entry.user.username,
    pointsTotal: entry.totalPoints,
    profilePicUrl: entry.user.profilePicUrl,
    trend: undefined as 'up' | 'down' | 'same' | undefined, // Backend should provide trend
  }));

  const totalPages = Math.ceil(apiResponse.total / apiResponse.limit);

  let me: LeaderboardResponse['me'];
  if (apiResponse.me) {
    me = {
      position: apiResponse.me.position,
      userId: 'me',
      username: apiResponse.me.user.username,
      pointsTotal: apiResponse.me.totalPoints,
      profilePicUrl: apiResponse.me.user.profilePicUrl,
    };
  }

  return {
    rows,
    page: apiResponse.page,
    size: apiResponse.limit,
    total: apiResponse.total,
    totalPages,
    hasMore: apiResponse.page < totalPages,
    me,
  };
}

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

      const response = await httpClient.get<LeaderboardApiResponse>(
        `/fantasy/leaderboard?${params.toString()}`,
        true
      );

      return transformLeaderboardResponse(response, filters);
    },
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true, // Keep previous data while loading new page
    select: (data) => {
      // Additional client-side processing for tied positions
      const processedRows = data.rows.map((row, index, array) => {
        // Find if there are ties
        const sameScoreCount = array.filter(r => r.pointsTotal === row.pointsTotal).length;
        const isFirstWithScore = array.findIndex(r => r.pointsTotal === row.pointsTotal) === index;
        
        if (sameScoreCount > 1 && !isFirstWithScore) {
          // This is a tied position, prefix with "="
          const firstPosition = array.find(r => r.pointsTotal === row.pointsTotal)?.position || row.position;
          return {
            ...row,
            position: firstPosition, // Same position number
            displayPosition: `=${firstPosition}`, // Display with equals sign
          };
        }
        
        return {
          ...row,
          displayPosition: row.position.toString(),
        };
      });

      return {
        ...data,
        rows: processedRows,
      };
    },
  });
}

/**
 * Hook para obtener el equipo de un usuario específico
 */
export function useUserTeam(userId: string, phase: FantasyPhase, enabled = true) {
  const isFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_VIEW_TEAMS !== 'false';
  
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

      // Try multiple endpoint patterns since backend might use different routes
      let response: UserTeamApiResponse;
      try {
        response = await httpClient.get<UserTeamApiResponse>(
          `/fantasy/team?userId=${userId}&phase=${phase}`
        );
      } catch (error) {
        // Try alternative endpoint format
        response = await httpClient.get<UserTeamApiResponse>(
          `/fantasy/teams/${userId}?phase=${phase}`
        );
      }
      
      return {
        userId: response.team.userId,
        username: response.user.username,
        profilePicUrl: response.user.profilePicUrl,
        phase: response.team.phase as 'group' | 'playoffs',
        players: response.team.players,
        pointsTotal: response.team.pointsTotal,
        createdAt: response.team.createdAt,
      };
    },
    enabled: enabled && isFeatureEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Limited retries since endpoint might not exist yet
  });
}

/**
 * Hook para buscar la posición del usuario actual
 */
export function useMyPosition(phase: FantasyPhase, enabled = false) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: leaderboardKeys.myPosition(phase),
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
      const response = await httpClient.get<{
        user: { username: string; profilePicUrl?: string };
        position: number;
        totalPoints: number;
      }>(`/fantasy/me?phase=${phase}`);
      
      return {
        position: response.position,
        userId: 'me',
        username: response.user.username,
        pointsTotal: response.totalPoints,
        profilePicUrl: response.user.profilePicUrl,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled,
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

/**
 * Hook personalizado que combina leaderboard + my position de manera eficiente
 */
export function useLeaderboardWithPosition(filters: LeaderboardFilters) {
  const leaderboardQuery = useLeaderboard(filters);
  
  // Extract my position from leaderboard response if available
  const myPosition = useMemo(() => {
    return leaderboardQuery.data?.me;
  }, [leaderboardQuery.data?.me]);

  // Only fetch separate position if not included in leaderboard
  const separatePositionQuery = useMyPosition(
    filters.phase, 
    !myPosition && !leaderboardQuery.isLoading
  );

  const effectiveMyPosition = myPosition || separatePositionQuery.data;

  return {
    ...leaderboardQuery,
    myPosition: effectiveMyPosition,
    isLoadingPosition: leaderboardQuery.isLoading || separatePositionQuery.isLoading,
  };
}