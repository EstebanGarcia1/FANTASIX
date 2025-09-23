// features/settings/components/AccountSection.tsx
'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal } from '../../../../shared/ui';
import { useSettings } from '../hooks/useSettings';
import { auth } from '../../../../shared/lib/firebase';
import { sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import type { BackendUser } from '../../../../shared/api/auth';
import type { User } from 'firebase/auth';
import toast from 'react-hot-toast';

interface AccountSectionProps {
  profile: BackendUser;
  user: User | null;
}

export function AccountSection({ profile, user }: AccountSectionProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const { deleteAccount } = useSettings();

  const isSocialProvider = user?.providerData.some(
    p => p.providerId === 'google.com' || p.providerId === 'github.com'
  );

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Te hemos enviado un correo para restablecer tu contraseña');
    } catch (error: any) {
      toast.error('Error al enviar el correo de restablecimiento');
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsChangingPassword(true);

    try {
      // Reauthenticate user first
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordForm.oldPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);
      
      toast.success('Contraseña actualizada correctamente');
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('La contraseña actual es incorrecta');
      } else if (error.code === 'auth/weak-password') {
        toast.error('La nueva contraseña es muy débil');
      } else {
        toast.error('Error al cambiar la contraseña');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'ELIMINAR') {
      toast.error('Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    setIsDeletingAccount(true);

    try {
      await deleteAccount();
      toast.success('Cuenta eliminada correctamente');
    } catch (error: any) {
      toast.error('Error al eliminar la cuenta');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Configuración de Cuenta
        </h2>
        
        <div className="space-y-6">
          {/* Account Info */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Información de la cuenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de usuario
                </label>
                <div className="text-gray-900 dark:text-white">{profile.username}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="text-gray-900 dark:text-white">{profile.email}</div>
              </div>
            </div>
          </div>

          {/* Password Management */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Contraseña
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isSocialProvider 
                    ? 'Cambio de contraseña no disponible para login social'
                    : 'Cambiar tu contraseña actual'
                  }
                </p>
              </div>
              
              {isSocialProvider ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasswordReset}
                >
                  Reset por email
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Cambiar contraseña
                </Button>
              )}
            </div>
          </div>

          {/* Delete Account */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                  Eliminar cuenta
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Esta acción no se puede deshacer
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                Eliminar cuenta
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Cambiar contraseña"
      >
        <div className="space-y-4">
          <Input
            label="Contraseña actual"
            type="password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
            placeholder="Ingresa tu contraseña actual"
            disabled={isChangingPassword}
          />
          
          <Input
            label="Nueva contraseña"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Mínimo 8 caracteres"
            disabled={isChangingPassword}
          />
          
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Repite la nueva contraseña"
            disabled={isChangingPassword}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              disabled={isChangingPassword}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePasswordChange}
              loading={isChangingPassword}
              disabled={!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              Cambiar contraseña
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirm('');
        }}
        title="Eliminar cuenta"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  ¡Atención!
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>
                    Esta acción eliminará permanentemente tu cuenta y todos los datos asociados.
                    No podrás recuperar tu progreso, equipos fantasy, o historial.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo:
            </label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="ELIMINAR"
              disabled={isDeletingAccount}
            />
          </div>

          <div className="flex items-center">
            <input
              id="confirm-delete"
              type="checkbox"
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              disabled={isDeletingAccount}
              required
            />
            <label htmlFor="confirm-delete" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Entiendo que esta acción es irreversible
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingAccount}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteAccount}
              loading={isDeletingAccount}
              disabled={deleteConfirm !== 'ELIMINAR'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}