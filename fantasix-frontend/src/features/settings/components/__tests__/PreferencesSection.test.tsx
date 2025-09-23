// features/settings/components/__tests__/PreferencesSection.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreferencesSection } from '../PreferencesSection';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

// Mocks
jest.mock('next-themes');
jest.mock('react-hot-toast');

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('PreferencesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'es'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders preferences correctly', async () => {
    render(<PreferencesSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Preferencias')).toBeInTheDocument();
      expect(screen.getByText('🇪🇸 Español')).toBeInTheDocument();
      expect(screen.getByText('☀️ Claro')).toBeInTheDocument();
    });
  });

  test('changes language preference', async () => {
    render(<PreferencesSection />);
    
    await waitFor(() => {
      expect(screen.getByText('🇺🇸 English')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🇺🇸 English'));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('fantasix-language', 'en');
      expect(mockToast.success).toHaveBeenCalledWith('Idioma cambiado a English');
    });
  });

  test('changes theme preference', async () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      ...mockUseTheme(),
      setTheme: mockSetTheme,
    });

    render(<PreferencesSection />);
    
    await waitFor(() => {
      expect(screen.getByText('🌙 Oscuro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🌙 Oscuro'));

    await waitFor(() => {
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      expect(mockToast.success).toHaveBeenCalledWith('Tema cambiado a oscuro');
    });
  });

  test('toggles notifications', async () => {
    render(<PreferencesSection />);
    
    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Notificaciones desactivadas');
    });
  });

  test('shows próximamente badge for notifications', async () => {
    render(<PreferencesSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Próximamente')).toBeInTheDocument();
    });
  });
});
