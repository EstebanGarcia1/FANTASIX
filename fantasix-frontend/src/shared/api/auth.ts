import type { User } from 'firebase/auth';
import httpClient from './http';

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  siegePoints: number;
  profilePicUrl?: string;
  hasClaimedDailyReward: boolean;
  createdAt: string;
  isAdmin?: boolean;
}

interface AuthMeResponse {
  user: BackendUser;
}

export async function syncUserWithBackend(firebaseUser: User): Promise<BackendUser> {
  try {
    const response = await httpClient.get<AuthMeResponse>('/auth/me');
    return response.user;
  } catch (error) {
    console.error('Failed to sync user with backend:', error);
    
    // If user doesn't exist in backend, we might need to create them
    // This depends on your backend implementation
    throw error;
  }
}

export async function getMe(): Promise<BackendUser> {
  const response = await httpClient.get<AuthMeResponse>('/auth/me');
  return response.user;
}