// src/features/profile/components/__tests__/RewardCard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RewardCard } from '../RewardCard';
import type { RewardsStatus } from '../../../../entities/profile/types';

// Mock hooks
const mockClaimReward = vi.fn();
vi.mock('../hooks/useProfile', () => ({
  useClaimDailyReward: () => ({
    mutateAsync: mockClaimReward,
    isPending: false,
  }),
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockRewardsAvailable: RewardsStatus = {
  canClaim: true,
  dailyStreak: 5,
  lastClaim: '2024-01-14T10:00:00Z',
};

const mockRewardsClaimed: RewardsStatus = {
  canClaim: false,
  dailyStreak: 5,
  lastClaim: '2024-01-15T10:00:00Z',
  nextClaimAt: '2024-01-16T10:00:00Z',
};

// src/features/profile/components/__tests__/RewardCard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RewardCard } from '../RewardCard';
import type { RewardsStatus } from '../../../../entities/profile/types';

// Mock hooks
const mockClaimReward = vi.fn();
vi.mock('../hooks/useProfile', () => ({
  useClaimDailyReward: () => ({
    mutateAsync: mockClaimReward,
    isPending: false,
  }),
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockRewardsAvailable: RewardsStatus = {
  canClaim: true,
  dailyStreak: 5,
  lastClaim: '2024-01-14T10:00:00Z',
};

const mockRewardsClaimed: RewardsStatus = {
  canClaim: false,
  dailyStreak: 5,
  lastClaim: '2024-01-15T10:00:00Z',
  nextClaimAt: '2024-01-16T10:00:00Z',
};

describe('RewardCard', () => {
  beforeEach(() => {
    mockClaimReward.mockClear();
  });

  it('renders available reward correctly', () => {
    render(<RewardCard rewards={mockRewardsAvailable} />);

    expect(screen.getByText('Recompensa Diaria')).toBeInTheDocument();
    expect(screen.getByText('+50 Siege Points disponibles')).toBeInTheDocument();
    expect(screen.getByText('Reclamar Recompensa')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Streak number
  });

  it('renders claimed reward correctly', () => {
    render(<RewardCard rewards={mockRewardsClaimed} />);

    expect(screen.getByText('✅ Recompensa ya reclamada hoy')).toBeInTheDocument();
    expect(screen.getByText('Ya reclamado hoy')).toBeInTheDocument();
    
    const claimButton = screen.getByRole('button', { name: /ya reclamado hoy/i });
    expect(claimButton).toBeDisabled();
  });

  it('calls claim reward when button clicked', async () => {
    mockClaimReward.mockResolvedValue({
      message: '¡Recompensa reclamada!',
      siegePoints: 50,
      dailyStreak: 6,
      totalSiegePoints: 1050,
    });

    render(<RewardCard rewards={mockRewardsAvailable} />);

    const claimButton = screen.getByText('Reclamar Recompensa');
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(mockClaimReward).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state during claim', () => {
    const loadingRewards = { ...mockRewardsAvailable };
    
    render(<RewardCard rewards={loadingRewards} isLoading={true} />);

    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('displays streak indicator for different values', () => {
    const zeroStreak = { ...mockRewardsAvailable, dailyStreak: 0 };
    const { rerender } = render(<RewardCard rewards={zeroStreak} />);

    expect(screen.getByText('¡Comienza tu racha')).toBeInTheDocument();

    const highStreak = { ...mockRewardsAvailable, dailyStreak: 30 };
    rerender(<RewardCard rewards={highStreak} />);

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Legendario')).toBeInTheDocument();
  });
});

// src/features/profile/components/__tests__/ProfileHeader.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileHeader } from '../ProfileHeader';
import type { UserProfile } from '../../../../entities/profile/types';

// Mock hooks and auth
const mockUpdateUsername = vi.fn();
const mockLogout = vi.fn();

vi.mock('../hooks/useProfile', () => ({
  useUpdateUsername: () => ({
    mutateAsync: mockUpdateUsername,
    isPending: false,
  }),
  useUpdateAvatar: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

const mockProfile: UserProfile = {
  id: 1,
  username: 'TestUser',
  email: 'test@example.com',
  siegePoints: 1000,
  hasChangedUsername: false,
  createdAt: '2024-01-01T00:00:00Z',
  profilePicUrl: 'https://example.com/avatar.jpg',
};

const mockProfileUsernameChanged: UserProfile = {
  ...mockProfile,
  hasChangedUsername: true,
};

describe('ProfileHeader', () => {
  beforeEach(() => {
    mockUpdateUsername.mockClear();
    mockLogout.mockClear();
  });

  it('renders profile information correctly', () => {
    render(<ProfileHeader profile={mockProfile} />);

    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('Siege Points')).toBeInTheDocument();
  });

  it('shows edit button when username not changed', () => {
    render(<ProfileHeader profile={mockProfile} />);

    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('hides edit button when username already changed', () => {
    render(<ProfileHeader profile={mockProfileUsernameChanged} />);

    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.getByText('Ya has cambiado tu nombre de usuario')).toBeInTheDocument();
  });

  it('enters edit mode when edit button clicked', () => {
    render(<ProfileHeader profile={mockProfile} />);

    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('TestUser')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('validates username input', () => {
    render(<ProfileHeader profile={mockProfile} />);

    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    const input = screen.getByDisplayValue('TestUser');
    fireEvent.change(input, { target: { value: 'ab' } }); // Too short

    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);

    expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument();
  });

  it('calls logout when logout button clicked', () => {
    render(<ProfileHeader profile={mockProfile} />);

    const logoutButton = screen.getByText('Cerrar sesión');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('shows admin badge for admin users', () => {
    const adminProfile = { ...mockProfile, isAdmin: true };
    render(<ProfileHeader profile={adminProfile} />);

    expect(screen.getByText('👑 Admin')).toBeInTheDocument();
  });
});

// src/features/profile/components/__tests__/StreakIndicator.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakIndicator } from '../StreakIndicator';

describe('StreakIndicator', () => {
  it('shows beginner state for zero streak', () => {
    render(<StreakIndicator dailyStreak={0} />);

    expect(screen.getByText('😴')).toBeInTheDocument();
    expect(screen.getByText(/Comienza tu racha/)).toBeInTheDocument();
  });

  it('shows correct tier for streak values', () => {
    const { rerender } = render(<StreakIndicator dailyStreak={1} />);
    expect(screen.getByText('Principiante')).toBeInTheDocument();

    rerender(<StreakIndicator dailyStreak={5} />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('Consistente')).toBeInTheDocument();

    rerender(<StreakIndicator dailyStreak={10} />);
    expect(screen.getByText('💪')).toBeInTheDocument();
    expect(screen.getByText('Semanal')).toBeInTheDocument();

    rerender(<StreakIndicator dailyStreak={30} />);
    expect(screen.getByText('👑')).toBeInTheDocument();
    expect(screen.getByText('Legendario')).toBeInTheDocument();
  });

  it('shows progress to next tier', () => {
    render(<StreakIndicator dailyStreak={5} />);

    expect(screen.getByText('Progreso a Semanal')).toBeInTheDocument();
    expect(screen.getByText('5/7')).toBeInTheDocument();
    expect(screen.getByText('2 días restantes')).toBeInTheDocument();
  });

  it('shows achieved milestones', () => {
    render(<StreakIndicator dailyStreak={10} />);

    expect(screen.getByText('Logros desbloqueados:')).toBeInTheDocument();
    // Should show badges for achieved tiers (1d, 3d, 7d)
    expect(screen.getByText('1d')).toBeInTheDocument();
    expect(screen.getByText('3d')).toBeInTheDocument();
    expect(screen.getByText('7d')).toBeInTheDocument();
  });

  it('shows fun facts for high streaks', () => {
    render(<StreakIndicator dailyStreak={35} />);

    expect(screen.getByText(/más de un mes/)).toBeInTheDocument();
  });
});