// src/entities/rewards/api.ts

import httpClient from '../../shared/api/http';
import type { 
  RewardsStatus, 
  ClaimRewardResponse,
  UserProfile,
  UpdateUsernameRequest,
  UpdateUsernameResponse,
  UpdateAvatarRequest,
  UpdateAvatarResponse
} from '../profile/types';

// API Response adapters
interface BackendRewardsStatus {
  canClaim: boolean;
  lastClaim?: string;
  dailyStreak: number;
  nextClaimAt?: string;
}

interface BackendUserProfile {
  id: number;
  username: string;
  email: string;
  siegePoints: number;
  profilePicUrl?: string;
  hasChangedUsername: boolean;
  createdAt: string;
  isAdmin?: boolean;
}

interface BackendClaimResponse {
  message: string;
  siegePoints: number;
  dailyStreak: number;
  totalSiegePoints: number;
}

// Transform backend data to frontend types
function adaptUserProfile(backendProfile: BackendUserProfile): UserProfile {
  return {
    id: backendProfile.id,
    username: backendProfile.username,
    email: backendProfile.email,
    siegePoints: backendProfile.siegePoints,
    profilePicUrl: backendProfile.profilePicUrl,
    hasChangedUsername: backendProfile.hasChangedUsername,
    createdAt: backendProfile.createdAt,
    isAdmin: backendProfile.isAdmin,
  };
}

function adaptRewardsStatus(backendStatus: BackendRewardsStatus): RewardsStatus {
  return {
    canClaim: backendStatus.canClaim,
    lastClaim: backendStatus.lastClaim,
    dailyStreak: backendStatus.dailyStreak,
    nextClaimAt: backendStatus.nextClaimAt,
  };
}

// API Functions
export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const response = await httpClient.get<{ user: BackendUserProfile }>('/auth/me');
    return adaptUserProfile(response.user);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}

export async function fetchRewardsStatus(): Promise<RewardsStatus> {
  try {
    const response = await httpClient.get<BackendRewardsStatus>('/rewards/status');
    return adaptRewardsStatus(response);
  } catch (error) {
    console.error('Failed to fetch rewards status:', error);
    throw error;
  }
}

export async function claimDailyReward(): Promise<ClaimRewardResponse> {
  try {
    const response = await httpClient.post<BackendClaimResponse>('/rewards/claim-daily');
    return {
      message: response.message,
      siegePoints: response.siegePoints,
      dailyStreak: response.dailyStreak,
      totalSiegePoints: response.totalSiegePoints,
    };
  } catch (error) {
    console.error('Failed to claim daily reward:', error);
    throw error;
  }
}

export async function updateUsername(request: UpdateUsernameRequest): Promise<UpdateUsernameResponse> {
  try {
    const response = await httpClient.put<{
      success: boolean;
      username: string;
      message: string;
    }>('/profile/username', request);
    
    return {
      success: response.success,
      username: response.username,
      message: response.message,
    };
  } catch (error: any) {
    console.error('Failed to update username:', error);
    
    // Handle specific validation errors
    if (error.status === 409) {
      throw new Error('Este nombre de usuario ya está en uso');
    }
    if (error.status === 400) {
      throw new Error('Nombre de usuario inválido');
    }
    
    throw new Error('Error al actualizar el nombre de usuario');
  }
}

export async function updateAvatar(request: UpdateAvatarRequest): Promise<UpdateAvatarResponse> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('avatar', request.avatarFile);

    const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/profile/avatar`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`, // Helper function needed
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    const data = await response.json();
    
    return {
      success: data.success,
      profilePicUrl: data.profilePicUrl,
      message: data.message,
    };
  } catch (error) {
    console.error('Failed to update avatar:', error);
    throw new Error('Error al actualizar el avatar');
  }
}

// Helper function to get auth token (implement based on your auth setup)
async function getAuthToken(): Promise<string> {
  // This should match your auth implementation
  // For Firebase: return await auth.currentUser?.getIdToken() || '';
  return ''; // Placeholder
}

// Username validation helper
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const trimmed = username.trim();
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }
  
  if (trimmed.length > 20) {
    return { isValid: false, error: 'El nombre no puede tener más de 20 caracteres' };
  }
  
  // Basic alphanumeric + underscore validation
  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(trimmed)) {
    return { isValid: false, error: 'Solo se permiten letras, números y guiones bajos' };
  }
  
  // Check for prohibited words (basic list)
  const prohibitedWords = ['admin', 'moderator', 'fantasix', 'null', 'undefined'];
  const lowerUsername = trimmed.toLowerCase();
  
  for (const word of prohibitedWords) {
    if (lowerUsername.includes(word)) {
      return { isValid: false, error: 'Este nombre no está permitido' };
    }
  }
  
  return { isValid: true };
}