// src/features/matches/hooks/useMatches.ts

import { useQuery } from '@tanstack/react-query';
import { fetchMatches } from '../../../entities/matches/api';
import type { MatchFilters, MatchTab } from '../../../entities/matches/types';

// Query Keys
const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (filters: MatchFilters) => [...matchKeys.lists(), filters] as const,
};

export function useMatches(scope: MatchTab, filters: Omit<MatchFilters, 'scope'> = {}) {
  const fullFilters: MatchFilters = {
    scope,
    size: 20,
    ...filters,
  };

  return useQuery({
    queryKey: matchKeys.list(fullFilters),
    queryFn: () => fetchMatches(fullFilters),
    staleTime: scope === 'upcoming' ? 30 * 1000 : 5 * 60 * 1000, // 30s for upcoming, 5min for recent
    keepPreviousData: true,
    refetchInterval: scope === 'upcoming' ? 60 * 1000 : false, // Auto-refresh upcoming matches
    select: (data) => {
      // Sort matches by date
      const sortedMatches = [...data.matches].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        
        // Upcoming: ASC (earliest first)
        // Recent: DESC (latest first)
        return scope === 'upcoming' ? dateA - dateB : dateB - dateA;
      });

      return {
        ...data,
        matches: sortedMatches,
      };
    },
  });
}

// Hook for live matches
export function useLiveMatches() {
  return useQuery({
    queryKey: matchKeys.list({ scope: 'live' }),
    queryFn: () => fetchMatches({ scope: 'live', size: 10 }),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // Refresh every 15 seconds
  });
}

// Hook for invalidating match queries
export function useInvalidateMatches() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: matchKeys.all }),
    invalidateByScope: (scope: MatchTab) => 
      queryClient.invalidateQueries({ 
        queryKey: matchKeys.list({ scope }) 
      }),
  };
}