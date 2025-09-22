// src/app/(private)/app/profile/page.tsx

'use client';

import { Card, LoadingSpinner, Button } from '../../../../shared/ui';
import { ProfileHeader } from '../../../../features/profile/components/ProfileHeader';
import { RewardCard } from '../../../../features/profile/components/RewardCard';
import { useProfileWithRewards } from '../../../../features/profile/hooks/useProfile';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { 
    profile, 
    rewards, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useProfileWithRewards();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  if (isError) {
    return (
      <div className="container-responsive py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Perfil
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Tu información personal y recompensas
          </p>
        </div>

        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error al cargar el perfil
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error?.message || 'No se pudieron obtener los datos del perfil'}
            </p>
            <Button onClick={handleRefresh}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-responsive py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Perfil
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Tu información personal y recompensas
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Header Skeleton */}
          <Card padding="lg">
            <div className="animate-pulse">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Rewards Skeleton */}
          <Card padding="lg">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Perfil
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Tu información personal y recompensas
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2">
          <ProfileHeader 
            profile={profile!} 
            isLoading={false}
          />
        </div>

        {/* Right Column - Rewards */}
        <div className="lg:col-span-1">
          <RewardCard 
            rewards={rewards!}
            isLoading={false}
          />
        </div>
      </div>

      {/* Additional Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="text-center">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            Actividad
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {rewards?.dailyStreak || 0} días de racha
          </p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            Fantasy
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Equipos activos
          </p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            Logros
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Próximamente
          </p>
        </Card>
      </div>

      {/* Account Settings Section */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuración de cuenta
        </h3>
        
        <div className="space-y-4">
          {/* Privacy Settings */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Perfil público
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permite que otros usuarios vean tu perfil
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Notificaciones
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recibe alertas sobre partidos y recompensas
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>

          {/* Data Export */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Exportar datos
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Descarga una copia de tus datos
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}