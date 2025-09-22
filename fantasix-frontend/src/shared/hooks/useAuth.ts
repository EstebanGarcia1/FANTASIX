import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, authHelpers } from '../lib/firebase';
import { syncUserWithBackend } from '../api/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Sync with backend when user is authenticated
          await syncUserWithBackend(user);
        }
        
        setState({
          user,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Auth state change error:', error);
        setState({
          user: null,
          loading: false,
          error: 'Error sincronizando con el servidor',
        });
      }
    });

    return unsubscribe;
  }, []);

  const handleAuthAction = async (
    action: () => Promise<any>,
    errorMessage: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await action();
    } catch (error) {
      console.error('Auth action error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const actions: AuthActions = {
    loginWithGoogle: () =>
      handleAuthAction(
        authHelpers.loginWithGoogle,
        'Error al iniciar sesión con Google'
      ),

    loginWithGithub: () =>
      handleAuthAction(
        authHelpers.loginWithGithub,
        'Error al iniciar sesión con GitHub'
      ),

    loginWithEmail: (email: string, password: string) =>
      handleAuthAction(
        () => authHelpers.loginWithEmail(email, password),
        'Email o contraseña incorrectos'
      ),

    registerWithEmail: (email: string, password: string) =>
      handleAuthAction(
        () => authHelpers.registerWithEmail(email, password),
        'Error al crear la cuenta'
      ),

    logout: () =>
      handleAuthAction(
        authHelpers.logout,
        'Error al cerrar sesión'
      ),
  };

  return {
    ...state,
    ...actions,
  };
}