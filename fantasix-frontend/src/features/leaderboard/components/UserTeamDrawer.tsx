'use client';

import { useEffect } from 'react';
import { Avatar, LoadingSpinner, Button } from '../../../shared/ui';
import { useUserTeam } from '../hooks/useLeaderboard';
import type { FantasyPhase } from '../../../entities/types';
import { clsx } from 'clsx';

interface UserTeamDrawerProps {
  userId: string;
  phase: FantasyPhase;
  isOpen: boolean;
  onClose: () => void;
}

export function UserTeamDrawer({ userId, phase, isOpen, onClose }: UserTeamDrawerProps) {
  const { data: userTeam, isLoading, error } = useUserTeam(userId, phase, isOpen);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Equipo Fantasy
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              aria-label="Cerrar drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-4 animate-pulse" />
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Error al cargar el equipo
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No se pudo obtener la información del equipo de este usuario.
                </p>
                {process.env.NEXT_PUBLIC_ENABLE_VIEW_TEAMS === 'false' && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <strong>Función en desarrollo:</strong> La visualización de equipos estará disponible cuando el draft esté cerrado.
                    </p>
                  </div>
                )}
              </div>
            ) : userTeam ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-6">
                  <Avatar
                    src={userTeam.profilePicUrl}
                    alt={userTeam.username}
                    size="lg"
                    fallback={userTeam.username[0]?.toUpperCase()}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {userTeam.username}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fase de {phase === 'group' ? 'Grupos' : 'Playoffs'}
                    </p>
                  </div>
                </div>

                {/* Team Players */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 9a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Jugadores ({userTeam.players.length}/5)
                  </h4>

                  <div className="space-y-3">
                    {userTeam.players.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <Avatar
                              src={player.imageUrl}
                              alt={player.nickname}
                              size="md"
                              fallback={player.nickname[0]?.toUpperCase()}
                            />
                            <div className="absolute -top-1 -left-1 w-5 h-5 bg-brand-100 dark:bg-brand-900 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {player.nickname}
                            </p>
                            {player.role && (
                              <span
                                className={clsx(
                                  'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                                  player.role === 'Entry' && 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
                                  player.role === 'Flex' && 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
                                  player.role === 'Support' && 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                )}
                              >
                                {player.role}
                              </span>
                            )}
                          </div>
                          
                          {player.Team && (
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                {player.Team.logoUrl ? (
                                  <img
                                    src={player.Team.logoUrl}
                                    alt={player.Team.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-medium text-gray-500">
                                    {player.Team.name[0]}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {player.Team.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {player.totalPoints}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Points */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 rounded-lg border border-brand-200 dark:border-brand-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-brand-900 dark:text-brand-100">
                          Puntos totales
                        </span>
                      </div>
                      <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                        {userTeam.pointsTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Equipo creado el {new Date(userTeam.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay equipo disponible
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Este usuario aún no ha creado un equipo para esta fase.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}