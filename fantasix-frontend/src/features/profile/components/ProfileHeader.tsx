// src/features/profile/components/ProfileHeader.tsx

'use client';

import { useState, useRef } from 'react';
import { Card, Avatar, Button, Input } from '../../../shared/ui';
import { useUpdateUsername, useUpdateAvatar } from '../hooks/useProfile';
import { validateUsername } from '../../../entities/rewards/api';
import { useAuth } from '../../../shared/hooks/useAuth';
import type { UserProfile } from '../../../entities/profile/types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface ProfileHeaderProps {
  profile: UserProfile;
  isLoading?: boolean;
}

export function ProfileHeader({ profile, isLoading }: ProfileHeaderProps) {
  const { logout } = useAuth();
  const updateUsernameMutation = useUpdateUsername();
  const updateAvatarMutation = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Username editing state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState(profile?.username || '');
  const [usernameError, setUsernameError] = useState('');

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleUsernameEdit = () => {
    if (profile?.hasChangedUsername) {
      toast.error('Solo puedes cambiar tu nombre de usuario una vez');
      return;
    }
    
    setIsEditingUsername(true);
    setUsernameValue(profile?.username || '');
    setUsernameError('');
  };

  const handleUsernameSave = async () => {
    const validation = validateUsername(usernameValue);
    
    if (!validation.isValid) {
      setUsernameError(validation.error || 'Nombre de usuario inválido');
      return;
    }

    try {
      const result = await updateUsernameMutation.mutateAsync({
        username: usernameValue.trim(),
      });
      
      toast.success(result.message);
      setIsEditingUsername(false);
      setUsernameError('');
    } catch (error: any) {
      setUsernameError(error.message);
    }
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setUsernameValue(profile?.username || '');
    setUsernameError('');
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    
    try {
      const result = await updateAvatarMutation.mutateAsync({
        avatarFile: file,
      });
      
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.error('Funcionalidad de eliminación de cuenta no disponible aún');
  };

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card padding="lg">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Error al cargar el perfil
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
          {/* Avatar */}
          <div className="relative group">
            <Avatar
              src={profile.profilePicUrl}
              alt={profile.username}
              size="xl"
              fallback={profile.username[0]?.toUpperCase()}
              className="cursor-pointer"
              onClick={handleAvatarClick}
            />
            
            {/* Avatar overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center cursor-pointer transition-all"
              onClick={handleAvatarClick}
            >
              <svg 
                className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          {/* User Details */}
          <div className="flex-1 mt-4 sm:mt-0">
            {/* Username */}
            <div className="space-y-2">
              {isEditingUsername ? (
                <div className="space-y-2">
                  <Input
                    value={usernameValue}
                    onChange={(e) => setUsernameValue(e.target.value)}
                    error={usernameError}
                    placeholder="Nuevo nombre de usuario"
                    className="text-lg font-semibold"
                    maxLength={20}
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleUsernameSave}
                      loading={updateUsernameMutation.isPending}
                      disabled={!usernameValue.trim() || updateUsernameMutation.isPending}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUsernameCancel}
                      disabled={updateUsernameMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.username}
                  </h2>
                  
                  {profile.isAdmin && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      👑 Admin
                    </span>
                  )}
                  
                  {!profile.hasChangedUsername && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleUsernameEdit}
                      className="text-brand-600 hover:text-brand-700"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {profile.email}
            </p>

            {/* Member since */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
              })}
            </p>

            {/* Username change warning */}
            {profile.hasChangedUsername && (
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                ⚠️ Ya has cambiado tu nombre de usuario
              </div>
            )}
          </div>
        </div>

        {/* Siege Points */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.siegePoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Siege Points
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-700 dark:text-gray-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAccount}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar cuenta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}