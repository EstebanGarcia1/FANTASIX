// Update shared/ui/index.ts to export Modal
export { Modal } from './Modal';

// features/settings/components/__tests__/AccountSection.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountSection } from '../AccountSection';
import { useSettings } from '../../hooks/useSettings';
import { auth } from '../../../../shared/lib/firebase';
import toast from 'react-hot-toast';

// Mocks
jest.mock('../../hooks/useSettings');
jest.mock('../../../../shared/lib/firebase');
jest.mock('react-hot-toast');

const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;
const mockToast = toast as jest.Mocked<typeof toast>;

const mockProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  siegePoints: 1000,
  hasChangedUsername: false,
  createdAt: '2024-01-01T00:00:00Z',
  hasClaimedDailyReward: false,
  isAdmin: false,
};

const mockUser = {
  email: 'test@example.com',
  providerData: [{ providerId: 'password' }],
} as any;

const mockSocialUser = {
  email: 'test@example.com',
  providerData: [{ providerId: 'google.com' }],
} as any;

describe('AccountSection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    jest.clearAllMocks();
    
    mockUseSettings.mockReturnValue({
      deleteAccount: jest.fn(),
      changePassword: jest.fn(),
      sendPasswordReset: jest.fn(),
      logoutAllDevices: jest.fn(),
      isChangingPassword: false,
      isDeletingAccount: false,
    });
  });

  const renderComponent = (user = mockUser) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AccountSection profile={mockProfile} user={user} />
      </QueryClientProvider>
    );
  };

  test('renders account information correctly', () => {
    renderComponent();
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('shows change password button for email users', () => {
    renderComponent();
    
    expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument();
    expect(screen.queryByText('Reset por email')).not.toBeInTheDocument();
  });

  test('shows reset by email for social users', () => {
    renderComponent(mockSocialUser);
    
    expect(screen.getByText('Reset por email')).toBeInTheDocument();
    expect(screen.queryByText('Cambiar contraseña')).not.toBeInTheDocument();
    expect(screen.getByText('Cambio de contraseña no disponible para login social')).toBeInTheDocument();
  });

  test('opens password change modal', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Cambiar contraseña'));
    
    await waitFor(() => {
      expect(screen.getByText('Contraseña actual')).toBeInTheDocument();
    });
  });

  test('validates password change form', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Cambiar contraseña'));
    
    await waitFor(() => {
      expect(screen.getByText('Contraseña actual')).toBeInTheDocument();
    });

    // Try to submit without filling fields
    const changeButton = screen.getByRole('button', { name: 'Cambiar contraseña' });
    expect(changeButton).toBeDisabled();
  });

  test('opens delete account modal', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Eliminar cuenta'));
    
    await waitFor(() => {
      expect(screen.getByText('¡Atención!')).toBeInTheDocument();
    });
  });

  test('validates delete confirmation', async () => {
    const mockDeleteAccount = jest.fn();
    mockUseSettings.mockReturnValue({
      ...mockUseSettings(),
      deleteAccount: mockDeleteAccount,
    });

    renderComponent();
    
    fireEvent.click(screen.getByText('Eliminar cuenta'));
    
    await waitFor(() => {
      expect(screen.getByText('¡Atención!')).toBeInTheDocument();
    });

    // Try to delete without typing ELIMINAR
    const deleteButton = screen.getByRole('button', { name: 'Eliminar cuenta' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Debes escribir "ELIMINAR" para confirmar');
    });

    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  test('handles successful account deletion', async () => {
    const mockDeleteAccount = jest.fn().mockResolvedValue({ message: 'Cuenta eliminada' });
    mockUseSettings.mockReturnValue({
      ...mockUseSettings(),
      deleteAccount: mockDeleteAccount,
    });

    renderComponent();
    
    fireEvent.click(screen.getByText('Eliminar cuenta'));
    
    await waitFor(() => {
      expect(screen.getByText('¡Atención!')).toBeInTheDocument();
    });

    // Type ELIMINAR
    const input = screen.getByPlaceholderText('ELIMINAR');
    fireEvent.change(input, { target: { value: 'ELIMINAR' } });

    // Check checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Click delete
    const deleteButton = screen.getByRole('button', { name: 'Eliminar cuenta' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
    });
  });
});