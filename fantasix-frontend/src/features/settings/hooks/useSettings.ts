// features/settings/hooks/useSettings.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../shared/hooks/useAuth';
import { auth } from '../../../shared/lib/firebase';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import httpClient from '../../../shared/api/http';
import toast from 'react-hot-toast';

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
}

interface DeleteAccountResponse {
  message: string;
}

export function useSettings() {
  const router = useRouter();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // Change password mutation (backend-based)
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData): Promise<ChangePasswordResponse> => {
      return await httpClient.put('/auth/password', data);
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Contraseña actualizada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cambiar la contraseña');
      throw error;
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (): Promise<DeleteAccountResponse> => {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Try to delete from backend first
      try {
        const response = await httpClient.delete<DeleteAccountResponse>('/auth/me');
        
        // If backend deletion succeeds, delete from Firebase
        try {
          await deleteUser(user);
        } catch (firebaseError) {
          console.warn('Firebase user deletion failed, but backend succeeded:', firebaseError);
        }
        
        return response;
      } catch (error: any) {
        // If backend doesn't support deletion, show appropriate message
        if (error.status === 404 || error.status === 501) {
          throw new Error('Eliminación de cuenta no disponible. Contacta al soporte.');
        }
        throw error;
      }
    },
    onSuccess: async (data) => {
      // Clear all cached data
      queryClient.clear();
      
      // Logout and redirect
      try {
        await logout();
      } catch (logoutError) {
        console.warn('Logout after deletion failed:', logoutError);
      }
      
      // Force redirect to auth page
      router.push('/auth');
      
      // Show success message
      setTimeout(() => {
        toast.success(data.message || 'Cuenta eliminada correctamente');
      }, 100);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar la cuenta');
      throw error;
    },
  });

  // Reset password via email (Firebase only)
  const sendPasswordReset = async (email: string) => {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      toast.success('Te hemos enviado un correo para restablecer tu contraseña');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('No se encontró una cuenta con este email');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Demasiados intentos. Intenta más tarde.');
      } else {
        toast.error('Error al enviar el correo de restablecimiento');
      }
      throw error;
    }
  };

  // Logout from all devices (placeholder - would need backend support)
  const logoutAllDevices = async () => {
    try {
      // TODO: Call backend endpoint to invalidate all sessions
      // For now, just logout current session
      await logout();
      router.push('/auth');
      toast.success('Sesión cerrada correctamente');
    } catch (error: any) {
      toast.error('Error al cerrar sesión');
      throw error;
    }
  };

  return {
    // Mutations
    changePassword: changePasswordMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    
    // Utilities
    sendPasswordReset,
    logoutAllDevices,
    
    // States
    isChangingPassword: changePasswordMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}