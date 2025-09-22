'use client';

import { useState } from 'react';
import { Avatar, Button, Skeleton, EmptyState } from '../../../shared/ui';
import { UserTeamDrawer } from './UserTeamDrawer';
import type { LeaderboardRow } from '../../../entities/leaderboard/types';
import type { FantasyPhase } from '../../../entities/types';
import { clsx } from 'clsx';

interface LeaderboardTableProps {
  data: LeaderboardRow[];
  isLoading: boolean;
  phase: FantasyPhase;
  isDraftClosed: boolean;
  onViewTeam?: (userId: string) => void;
}

interface MedalProps {
  position: number;
}

function Medal({ position }: MedalProps) {
  const medals = {
    1: { emoji: '🥇', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    2: { emoji: '🥈', color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
    3: { emoji: '🥉', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  };

  const medal = medals[position as keyof typeof medals];

  if (!medal) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {position}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx(
      'w-8 h-8 rounded-full flex items-center justify-center',
      medal.bg
    )}>
      <span className="text-lg">{medal.emoji}</span>
    </div>
  );
}

function TrendIndicator({ trend }: { trend?: 'up' | 'down' | 'same' }) {
  if (!trend) return null;

  const indicators = {
    up: { icon: '▲', color: 'text-green-500' },
    down: { icon: '▼', color: 'text-red-500' },
    same: { icon: '●', color: 'text-gray-400' },
  };

  const indicator = indicators[trend];

  return (
    <span className={clsx('text-xs', indicator.color)}>
      {indicator.icon}
    </span>
  );
}

export function LeaderboardTable({ 
  data, 
  isLoading, 
  phase, 
  isDraftClosed,
  onViewTeam 
}: LeaderboardTableProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleViewTeam = (userId: string) => {
    if (!isDraftClosed) return;
    setSelectedUserId(userId);
    onViewTeam?.(userId);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <EmptyState
          title="No hay resultados"
          description="No se encontraron usuarios en el ranking"
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-1">Pos.</div>
            <div className="col-span-6 sm:col-span-5">Usuario</div>
            <div className="col-span-2 text-right">Puntos</div>
            <div className="col-span-1 text-center hidden sm:block">Tend.</div>
            <div className="col-span-3 sm:col-span-2 text-right">Acciones</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row) => {
            const isTopThree = row.position <= 3;
            
            return (
              <div
                key={row.userId}
                className={clsx(
                  'px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  isTopThree && 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10'
                )}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Position */}
                  <div className="col-span-1">
                    <Medal position={row.position} />
                  </div>

                  {/* User */}
                  <div className="col-span-6 sm:col-span-5 flex items-center space-x-3">
                    <Avatar
                      src={row.profilePicUrl}
                      alt={row.username}
                      size="sm"
                      fallback={row.username[0]?.toUpperCase()}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {row.username}
                      </p>
                      {isTopThree && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          {row.position === 1 && 'Campeón'}
                          {row.position === 2 && 'Subcampeón'}
                          {row.position === 3 && 'Tercer lugar'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {row.pointsTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="col-span-1 text-center hidden sm:block">
                    <TrendIndicator trend={row.trend} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTeam(row.userId)}
                      disabled={!isDraftClosed}
                      className="text-xs"
                    >
                      {isDraftClosed ? 'Ver equipo' : 'Draft abierto'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Team Drawer */}
      {selectedUserId && (
        <UserTeamDrawer
          userId={selectedUserId}
          phase={phase}
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
}