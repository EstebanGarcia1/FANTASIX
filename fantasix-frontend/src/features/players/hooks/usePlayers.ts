import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { 
  fetchPlayers, 
  fetchPlayerById, 
  fetchPlayerNextMatch,
  getMockPlayers,
  validatePlayerFilters
} from '../../../entities/players/api';
import type { 
  PlayerFilters, 
  PlayersResponse, 
  PlayerDetailed, 
  NextMatch 
} from '../../../entities/players/types';

// Query Keys
const playersKeys = {
  all: ['players'] as const,
  lists: () => [...playersKeys.all, 'list'] as const,
  list: (filters: PlayerFilters) => [...playersKeys.lists(), filters] as const,
  details: () => [...playersKeys.all, 'detail'] as const,
  detail: (id: number) => [...playersKeys.details(), id] as const,
  nextMatch: (playerId: number) => [...playersKeys.all, 'nextMatch', playerId] as const,
};

/**
 * Hook para obtener lista de jugadores con filtros
 */
export function usePlayers(filters: PlayerFilters = {}) {
  const validatedFilters = useMemo(() => validatePlayerFilters(filters), [filters]);
  
  return useQuery({
    queryKey: playersKeys.list(validatedFilters),
    queryFn: async (): Promise<PlayersResponse> => {
      // Check if we should use mock data
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_PLAYERS === 'true';
      
      if (useMockData) {
        // Return mock data with pagination simulation
        const allPlayers = getMockPlayers();
        const page = validatedFilters.page || 1;
        const limit = validatedFilters.limit || 20;
        const start = (page - 1) * limit;
        const end = start + limit;
        
        // Apply client-side filtering for mock data
        let filteredPlayers = allPlayers;
        
        if (validatedFilters.role) {
          filteredPlayers = filteredPlayers.filter(p => p.role === validatedFilters.role);
        }
        
        if (validatedFilters.teamId) {
          filteredPlayers = filteredPlayers.filter(p => p.teamId === validatedFilters.teamId);
        }
        
        if (validatedFilters.region) {
          filteredPlayers = filteredPlayers.filter(p => p.region === validatedFilters.region);
        }
        
        if (validatedFilters.search) {
          const searchLower = validatedFilters.search.toLowerCase();
          filteredPlayers = filteredPlayers.filter(p => 
            p.nickname.toLowerCase().includes(searchLower) ||
            p.realName?.toLowerCase().includes(searchLower) ||
            p.Team.name.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting
        if (validatedFilters.sortBy) {
          filteredPlayers.sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;
            
            switch (validatedFilters.sortBy) {
              case 'points':
                aVal = a.stats.currentPhasePoints;
                bVal = b.stats.currentPhasePoints;
                break;
              case 'name':
                aVal = a.nickname.toLowerCase();
                bVal = b.nickname.toLowerCase();
                break;
              case 'team':
                aVal = a.Team.name.toLowerCase();
                bVal = b.Team.name.toLowerCase();
                break;
              default:
                aVal = a.stats.currentPhasePoints;
                bVal = b.stats.currentPhasePoints;
            }
            
            if (validatedFilters.sortOrder === 'asc') {
              return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
              return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
          });
        }
        
        const paginatedPlayers = filteredPlayers.slice(start, end);
        const totalPages = Math.ceil(filteredPlayers.length / limit);
        
        return {
          players: paginatedPlayers,
          total: filteredPlayers.length,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        };
      }
      
      // Use real API
      return await fetchPlayers(validatedFilters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // For smooth pagination
    select: (data) => {
      // Additional client-side processing if needed
      return data;
    },
  });
}

/**
 * Hook para obtener detalles de un jugador específico
 */
export function usePlayerDetails(id: number, enabled = true) {
  return useQuery({
    queryKey: playersKeys.detail(id),
    queryFn: async (): Promise<PlayerDetailed> => {
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_PLAYERS === 'true';
      
      if (useMockData) {
        const mockPlayers = getMockPlayers();
        const player = mockPlayers.find(p => p.id === id);
        
        if (!player) {
          throw new Error(`Player with ID ${id} not found`);
        }
        
        return player;
      }
      
      return await fetchPlayerById(id);
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook para obtener el próximo partido de un jugador
 */
export function usePlayerNextMatch(playerId: number, enabled = true) {
  return useQuery({
    queryKey: playersKeys.nextMatch(playerId),
    queryFn: async (): Promise<NextMatch | null> => {
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_PLAYERS === 'true';
      
      if (useMockData) {
        // Mock next match data
        const mockNextMatch: NextMatch = {
          id: 999,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
          rivalTeam: {
            id: 99,
            name: 'Mock Rivals',
            logoUrl: 'https://example.com/mock-logo.png',
            region: 'EU',
          },
          tournament: {
            id: 1,
            name: 'Mock Championship',
          },
          round: 'Semifinal',
          format: 'BO3',
          isHome: true,
        };
        
        return mockNextMatch;
      }
      
      return await fetchPlayerNextMatch(playerId);
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}

/**
 * Hook para invalidar cache de jugadores cuando sea necesario
 */
export function useInvalidatePlayers() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: playersKeys.all });
    },
    invalidateList: (filters?: PlayerFilters) => {
      if (filters) {
        queryClient.invalidateQueries({ queryKey: playersKeys.list(filters) });
      } else {
        queryClient.invalidateQueries({ queryKey: playersKeys.lists() });
      }
    },
    invalidatePlayer: (id: number) => {
      queryClient.invalidateQueries({ queryKey: playersKeys.detail(id) });
    },
    prefetchPlayer: async (id: number) => {
      await queryClient.prefetchQuery({
        queryKey: playersKeys.detail(id),
        queryFn: () => fetchPlayerById(id),
        staleTime: 10 * 60 * 1000,
      });
    },
  };
}

/**
 * Hook combinado para obtener jugadores con sus teams para filtros
 */
export function usePlayersWithTeams(filters: PlayerFilters = {}) {
  const playersQuery = usePlayers(filters);
  
  // Extract unique teams from players for filter options
  const teams = useMemo(() => {
    if (!playersQuery.data?.players) return [];
    
    const uniqueTeams = new Map();
    playersQuery.data.players.forEach(player => {
      if (!uniqueTeams.has(player.Team.id)) {
        uniqueTeams.set(player.Team.id, player.Team);
      }
    });
    
    return Array.from(uniqueTeams.values());
  }, [playersQuery.data?.players]);

  // Extract unique regions
  const regions = useMemo(() => {
    if (!playersQuery.data?.players) return [];
    
    const uniqueRegions = new Set(
      playersQuery.data.players.map(player => player.region)
    );
    
    return Array.from(uniqueRegions).sort();
  }, [playersQuery.data?.players]);

  return {
    ...playersQuery,
    teams,
    regions,
  };
}

/**
 * Hook para obtener estadísticas resumidas de todos los jugadores
 */
export function usePlayersStats() {
  return useQuery({
    queryKey: ['playersStats'],
    queryFn: async () => {
      const { players } = await fetchPlayers({ limit: 1000 }); // Get all players for stats
      
      const totalPlayers = players.length;
      const activePhases = ['group', 'playoffs'];
      const topScorer = players.reduce((top, player) => 
        player.stats.currentPhasePoints > top.stats.currentPhasePoints ? player : top
      );
      
      const avgPointsPerPlayer = players.reduce((sum, player) => 
        sum + player.stats.currentPhasePoints, 0
      ) / totalPlayers;

      return {
        totalPlayers,
        topScorer,
        avgPointsPerPlayer: Math.round(avgPointsPerPlayer * 10) / 10,
        playersByRole: {
          Entry: players.filter(p => p.role === 'Entry').length,
          Flex: players.filter(p => p.role === 'Flex').length,
          Support: players.filter(p => p.role === 'Support').length,
        },
        playersByRegion: players.reduce((acc, player) => {
          acc[player.region] = (acc[player.region] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: process.env.NEXT_PUBLIC_USE_MOCK_PLAYERS !== 'true', // Only for real API
  });
}