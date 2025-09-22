// src/entities/profile/types.ts

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  siegePoints: number;
  profilePicUrl?: string;
  hasChangedUsername: boolean;
  createdAt: string;
  isAdmin?: boolean;
}

export interface RewardsStatus {
  canClaim: boolean;
  lastClaim?: string;
  dailyStreak: number;
  nextClaimAt?: string;
}

export interface ClaimRewardResponse {
  message: string;
  siegePoints: number;
  dailyStreak: number;
  totalSiegePoints: number;
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdateUsernameResponse {
  success: boolean;
  username: string;
  message: string;
}

export interface UpdateAvatarRequest {
  avatarFile: File;
}

export interface UpdateAvatarResponse {
  success: boolean;
  profilePicUrl: string;
  message: string;
}

// UI State types
export interface ProfileEditState {
  isEditingUsername: boolean;
  usernameValue: string;
  usernameError?: string;
}

export interface StreakTier {
  days: number;
  name: string;
  emoji: string;
  color: string;
  reward: number;
}

// Validation types
export interface UsernameValidation {
  isValid: boolean;
  error?: string;
  minLength: number;
  maxLength: number;
}