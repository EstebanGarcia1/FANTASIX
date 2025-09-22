// src/features/profile/hooks/useProfile.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchUserProfile, 
  fetchRewardsStatus, 
  claimDailyReward,
  updateUsername,
  updateAvatar
} from '../../../entities/rewards/api';
import type { 
  UpdateUsernameRequest, 
  UpdateAvatarRequest 
} from '../../../entities/profile/types';

// Query Keys
const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  rewards: () => [...profileKeys.all, 'rewards'] as const,
};

/**
 * Hook to fetch current user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch rewards status
 */
export function useRewardsStatus() {
  return useQuery({
    queryKey: profileKeys.rewards(),
    queryFn: fetchRewardsStatus,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to check claim availability
  });
}

/**
 * Hook to claim daily reward
 */
export function useClaimDailyReward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: claimDailyReward,
    onSuccess: (data) => {
      // Invalidate and update related queries
      queryClient.invalidateQueries({ queryKey: profileKeys.rewards() });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      
      // Optimistically update user points
      queryClient.setQueryData(profileKeys.me(), (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            siegePoints: data.totalSiegePoints,
          };
        }
        return oldData;
      });
      
      // Update rewards status
      queryClient.setQueryData(profileKeys.rewards(), (oldData: any) => {
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
    onError: (error) => {
      console.error('Failed to claim daily reward:', error);
    },
  });
}

/**
 * Hook to update username
 */
export function useUpdateUsername() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: UpdateUsernameRequest) => updateUsername(request),
    onSuccess: (data) => {
      // Update user profile with new username
      queryClient.setQueryData(profileKeys.me(), (oldData: any) => {
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
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
    onError: (error) => {
      console.error('Failed to update username:', error);
    },
  });
}

/**
 * Hook to update avatar
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: UpdateAvatarRequest) => updateAvatar(request),
    onSuccess: (data) => {
      // Update user profile with new avatar URL
      queryClient.setQueryData(profileKeys.me(), (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            profilePicUrl: data.profilePicUrl,
          };
        }
        return oldData;
      });
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
    onError: (error) => {
      console.error('Failed to update avatar:', error);
    },
  });
}

/**
 * Hook to invalidate all profile-related queries
 */
export function useInvalidateProfile() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }),
    invalidateMe: () => queryClient.invalidateQueries({ queryKey: profileKeys.me() }),
    invalidateRewards: () => queryClient.invalidateQueries({ queryKey: profileKeys.rewards() }),
  };
}

/**
 * Combined hook for profile and rewards data
 */
export function useProfileWithRewards() {
  const profileQuery = useUserProfile();
  const rewardsQuery = useRewardsStatus();
  
  return {
    profile: profileQuery.data,
    rewards: rewardsQuery.data,
    isLoading: profileQuery.isLoading || rewardsQuery.isLoading,
    isError: profileQuery.isError || rewardsQuery.isError,
    error: profileQuery.error || rewardsQuery.error,
    refetch: () => {
      profileQuery.refetch();
      rewardsQuery.refetch();
    },
  };
}