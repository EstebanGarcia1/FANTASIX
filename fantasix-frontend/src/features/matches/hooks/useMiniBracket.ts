// src/features/matches/hooks/useMiniBracket.ts

import { useQuery } from '@tanstack/react-query';
import { fetchBracket } from '../../../entities/matches/api';
import { useConfig } from '../../../shared/api/hooks';

// Query Keys
const bracketKeys = {
  all: ['bracket'] as const,
  tournament: (tournamentId: number) => [...bracketKeys.all, tournamentId] as const,
};

export function useMiniBracket() {
  // Get current tournament from config
  const { data: config } = useConfig();
  const activeTournamentId = config?.activeTournamentId;

  return useQuery({
    queryKey: bracketKeys.tournament(activeTournamentId || 0),
    queryFn: () => {
      if (!activeTournamentId) {
        return Promise.resolve(null);
      }
      return fetchBracket(activeTournamentId);
    },
    enabled: !!activeTournamentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Don't retry too much if bracket endpoint doesn't exist
    retryOnMount: false,
  });
}

// Hook for specific tournament bracket
export function useTournamentBracket(tournamentId: number, enabled = true) {
  return useQuery({
    queryKey: bracketKeys.tournament(tournamentId),
    queryFn: () => fetchBracket(tournamentId),
    enabled: enabled && !!tournamentId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}