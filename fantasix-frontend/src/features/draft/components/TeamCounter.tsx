'use client';

import { Card } from '../../../shared/ui';
import { countTeams } from '../lib/validateDraft';
import type { Player } from '../../../entities/types';
import { clsx } from 'clsx';

interface TeamCounterProps {
  selectedPlayers: Player[];
}

export function TeamCounter({ selectedPlayers }: TeamCounterProps) {
  const teamCounts = countTeams(selectedPlayers);
  const teamEntries = Object.entries(teamCounts);

  if (teamEntries.length === 0) {
    return (
      <Card padding="md">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Distribución por Equipo
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay jugadores seleccionados
        </p>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Distribución por Equipo
      </h4>

      <div className="space-y-2">
        {teamEntries.map(([teamName, count]) => {
          const isAtLimit = count >= 2;
          const isOverLimit = count > 2;
          
          return (
            <div key={teamName} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={clsx(
                    'w-3 h-3 rounded-full',
                    isOverLimit
                      ? 'bg-red-500'
                      : isAtLimit
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  )}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {teamName}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={clsx(
                    'text-sm font-medium',
                    isOverLimit
                      ? 'text-red-600 dark:text-red-400'
                      : isAtLimit
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  {count}/2
                </span>
                {isOverLimit && (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {isAtLimit && !isOverLimit && (
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Máximo 2 jugadores por equipo
        </p>
      </div>
    </Card>
  );
}