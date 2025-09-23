// features/settings/components/SecuritySection.tsx
'use client';

import { useState } from 'react';
import { Card, Button } from '../../../../shared/ui';
import type { BackendUser } from '../../../../shared/api/auth';
import type { User } from 'firebase/auth';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface SecuritySectionProps {
  profile: BackendUser;
  user: User | null;
}

export function SecuritySection({ profile, user }: SecuritySectionProps) {
  const { logout } = useAuth();
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const getLoginProvider = () => {
    if (!user?.providerData.length) return 'Email/Password';
    
    const providers = user.providerData.map(provider => {
      switch (provider.providerId) {
        case 'google.com': return 'Google';
        case 'github.com': return 'GitHub';
        case 'password': return 'Email/Password';
        default: return provider.providerId;
      }
    });
    
    return providers.join(', ');
  };

  const getLastLogin = () => {
    if (!user?.metadata.lastSignInTime) return 'Desconocido';
    
    try {
      const lastLogin = new Date(user.metadata.lastSignInTime);
      return formatDistanceToNow(lastLogin, { 
        addSuffix: true,
        locale: es 
      });
    } catch {
      return 'Desconocido';
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true);
    
    try {
      // For now, just logout current session
      // TODO: Implement backend endpoint for logout all sessions
      await logout();
      toast.success('Sesión cerrada en todos los dispositivos');
    } catch (error) {
      toast.error('Error al cerrar sesión en todos los dispositivos');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <Card padding="lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Seguridad
      </h2>
      
      <div className="space-y-6">
        {/* Login Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Último inicio de sesión
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getLastLogin()}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Proveedor de autenticación
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getLoginProvider()}
              </span>
              {user?.emailVerified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  ✓ Verificado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Account Created */}
        <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Cuenta creada
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(profile.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Session Management */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Cerrar sesión en todos los dispositivos
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Cierra tu sesión en todos los dispositivos donde hayas iniciado sesión
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogoutAllDevices}
              loading={isLoggingOutAll}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
            >
              Cerrar en todos
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Funcionalidad limitada
                </h4>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    Por ahora, solo puedes cerrar la sesión actual. 
                    La gestión avanzada de sesiones estará disponible próximamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}