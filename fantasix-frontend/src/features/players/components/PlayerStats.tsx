'use client';

import Link from 'next/link';
import { Card } from '../../../shared/ui';
import type { PlayerDetailed } from '../../../entities/players/types';
import { clsx } from 'clsx';

interface PlayerStatsProps {
  player: PlayerDetailed;
}

export function PlayerStats({ player }: PlayerStatsProps) {
  const { stats } = player;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estadísticas Generales
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalPoints}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Puntos totales
            </p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.gamesPlayed}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Partidos jugados
            </p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.averagePointsPerGame.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Promedio por partido
            </p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.currentPhasePoints}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Puntos fase actual
            </p>
          </div>
        </div>
      </Card>

      {/* Phase Breakdown */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Rendimiento por Fase
        </h3>
        
        <div className="space-y-4">
          {/* Group Phase */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-900 dark:text-white">
                Fase de Grupos
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats.groupPhasePoints}
              </span>
            </div>
          </div>

          {/* Playoffs Phase */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-gray-900 dark:text-white">
                Playoffs
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats.playoffsPoints}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance vs Rivals */}
      {stats.pointsByRival.length > 0 && (
        <Card padding="md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rendimiento vs Rivales
          </h3>
          
          <div className="space-y-3">
            {stats.pointsByRival.map((rival, index) => (
              <div
                key={`${rival.rivalTeam.id}-${rival.date}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {rival.rivalTeam.logoUrl ? (
                      <img
                        src={rival.rivalTeam.logoUrl}
                        alt={rival.rivalTeam.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-500">
                        {rival.rivalTeam.name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      vs {rival.rivalTeam.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(rival.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {rival.points}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/app/matches/${rival.matchId}`}
                    className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
                  >
                    Ver partido
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {stats.pointsByRival.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                No hay partidos registrados contra rivales
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Performance Indicators */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Indicadores de Rendimiento
        </h3>
        
        <div className="space-y-4">
          {/* Consistency Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Consistencia
            </span>
            <div className="flex items-center space-x-2">
              {/* Simple consistency calculation based on average */}
              {stats.averagePointsPerGame >= 60 ? (
                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Excelente</span>
                </div>
              ) : stats.averagePointsPerGame >= 40 ? (
                <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Buena</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Mejorable</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Level */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Actividad
            </span>
            <div className="flex items-center space-x-1">
              <div className={clsx(
                'w-2 h-2 rounded-full',
                player.isActive ? 'bg-green-500' : 'bg-red-500'
              )}></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {player.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Fantasy Value */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Valor Fantasy
            </span>
            <div className="flex items-center space-x-1">
              {stats.averagePointsPerGame >= 60 ? (
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Alto
                </span>
              ) : stats.averagePointsPerGame >= 40 ? (
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Medio
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Bajo
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}