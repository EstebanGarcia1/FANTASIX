// src/shared/api/hooks.ts - Updated with profile hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import httpClient from './http';
import type {
  GlobalConfig,
  Player,
  Team,
  Match,
  FantasyTeam,
  LeaderboardEntry,
  FantasyPhase,
  PlayerFilters,
  MatchFilters,
} from '../../entities/types';

// Import profile types and functions
import { 
  fetchUserProfile, 
  fetchRewardsStatus, 
  claimDailyReward,
  updateUsername,
  updateAvatar
} from '../../entities/rewards/api';
import type { 
  UserProfile,
  RewardsStatus,
  UpdateUsernameRequest, 
  UpdateAvatarRequest 
} from '../../entities/profile/types';

// Query Keys
export const queryKeys = {
  config: ['config'] as const,
  players: (filters?: PlayerFilters) => ['players', filters] as const,
  teams: ['teams'] as const,
  matches: (filters?: MatchFilters) => ['matches', filters] as const,
  myFantasyTeam: (phase: FantasyPhase) => ['fantasy', 'me', phase] as const,
  leaderboard: (phase?: FantasyPhase, page = 1) => ['leaderboard', phase, page] as const,
  rewards: ['rewards', 'status'] as const,
  profile: ['profile', 'me'] as const,
};

// Config
export function useConfig() {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: async () => {
      const response = await httpClient.get<{ config: GlobalConfig }>('/config', false);
      return response.config;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Players
export function usePlayers(filters?: PlayerFilters) {
  return useQuery({
    queryKey: queryKeys.players(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.role) params.append('role', filters.role);
      if (filters?.teamId) params.append('teamId', filters.teamId.toString());
      if (filters?.region) params.append('region', filters.region);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const query = params.toString();
      const path = `/api/players${query ? `?${query}` : ''}`;
      
      return await httpClient.get<Player[]>(path, false);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Teams
export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: () => httpClient.get<Team[]>('/api/teams', false),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Matches
export function useMatches(filters?: MatchFilters) {
  return useQuery({
    queryKey: queryKeys.matches(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.scope) params.append('scope', filters.scope);
      if (filters?.tournamentId) params.append('tournamentId', filters.tournamentId.toString());
      if (filters?.teamId) params.append('teamId', filters.teamId.toString());
      if (filters?.round) params.append('round', filters.round);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.size) params.append('size', filters.size.toString());

      const query = params.toString();
      const path = `/api/matches${query ? `?${query}` : ''}`;
      
      const response = await httpClient.get<{ matches: Match[] }>(path, false);
      return response.matches;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: filters?.scope === 'upcoming' ? 60 * 1000 : false, // Auto-refresh upcoming
  });
}

// Profile - NEW
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Rewards Status - UPDATED
export function useRewardsStatus() {
  return useQuery({
    queryKey: queryKeys.rewards,
    queryFn: fetchRewardsStatus,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Claim Daily Reward - UPDATED
export function useClaimDailyReward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: claimDailyReward,
    onSuccess: (data) => {
      // Invalidate and update related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      
      // Optimistically update user points
      queryClient.setQueryData(queryKeys.profile, (oldData: UserProfile | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            siegePoints: data.totalSiegePoints,
          };
        }
        return oldData;
      });
      
      // Update rewards status
      queryClient.setQueryData(queryKeys.rewards, (oldData: RewardsStatus | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            canClaim: false,
            dailyStreak: data.dailyStreak,
            lastClaim: new Date().toISOString(),
          };
        }
        return oldData;
      });
    },
  });
}

// Update Username - NEW
export function useUpdateUsername() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: UpdateUsernameRequest) => updateUsername(request),
    onSuccess: (data) => {
      // Update user profile with new username
      queryClient.setQueryData(queryKeys.profile, (oldData: UserProfile | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            username: data.username,
            hasChangedUsername: true,
          };
        }
        return oldData;
      });
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

// Update Avatar - NEW
export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: UpdateAvatarRequest) => updateAvatar(request),
    onSuccess: (data) => {
      // Update user profile with new avatar URL
      queryClient.setQueryData(queryKeys.profile, (oldData: UserProfile | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            profilePicUrl: data.profilePicUrl,
          };
        }
        return oldData;
      });
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

// My Fantasy Team
export function useMyFantasyTeam(phase: FantasyPhase) {
  return useQuery({
    queryKey: queryKeys.myFantasyTeam(phase),
    queryFn: async () => {
      const response = await httpClient.get<{ team: FantasyTeam }>(`/fantasy/my-team?phase=${phase}`);
      return response.team;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Submit Fantasy Team
export function useSubmitFantasyTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      phase, 
      players, 
      allPlayers 
    }: { 
      phase: FantasyPhase; 
      players: string[];
      allPlayers: Player[];
    }) => {
      return await httpClient.post('/fantasy/submit-team', { phase, players });
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.myFantasyTeam(variables.phase) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard() });
    },
  });
}

// Leaderboard
export function useLeaderboard(phase?: FantasyPhase, page = 1) {
  return useQuery({
    queryKey: queryKeys.leaderboard(phase, page),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (phase) params.append('phase', phase);
      params.append('page', page.toString());
      params.append('limit', '20');

      const query = params.toString();
      const response = await httpClient.get<{ leaderboard: LeaderboardEntry[] }>(`/fantasy/leaderboard?${query}`, false);
      return response.leaderboard;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}