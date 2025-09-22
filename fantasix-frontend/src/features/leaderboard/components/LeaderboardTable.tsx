'use client';

import { useState, useRef, useEffect } from 'react';
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
  currentPage: number;
  pageSize: number;
  onViewTeam?: (userId: string) => void;
  highlightPosition?: number;
}

interface MedalProps {
  position: number;
  displayPosition?: string;
}

function Medal({ position, displayPosition }: MedalProps) {
  const medals = {
    1: { emoji: '🥇', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Primer lugar' },
    2: { emoji: '🥈', color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', label: 'Segundo lugar' },
    3: { emoji: '🥉', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Tercer lugar' },
  };

  const medal = medals[position as keyof typeof medals];

  if (!medal) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {displayPosition || position}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center',
        medal.bg
      )}
      aria-label={medal.label}
      title={medal.label}
    >
      <span className="text-lg" aria-hidden="true">{medal.emoji}</span>
    </div>
  );
}

function TrendIndicator({ trend }: { trend?: 'up' | 'down' | 'same' }) {
  if (!trend) return null;

  const indicators = {
    up: { icon: '▲', color: 'text-green-500', label: 'Subió posiciones' },
    down: { icon: '▼', color: 'text-red-500', label: 'Bajó posiciones' },
    same: { icon: '●', color: 'text-gray-400', label: 'Mantuvo posición' },
  };

  const indicator = indicators[trend];

  return (
    <span 
      className={clsx('text-xs', indicator.color)}
      aria-label={indicator.label}
      title={indicator.label}
    >
      {indicator.icon}
    </span>
  );
}

export function LeaderboardTable({ 
  data, 
  isLoading, 
  phase, 
  isDraftClosed,
  currentPage,
  pageSize,
  onViewTeam,
  highlightPosition
}: LeaderboardTableProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const handleViewTeam = (userId: string) => {
    if (!isDraftClosed) return;
    setSelectedUserId(userId);
    onViewTeam?.(userId);
  };

  // Handle scrolling to highlighted position
  useEffect(() => {
    if (highlightPosition && tableRef.current) {
      const startPosition = (currentPage - 1) * pageSize + 1;
      const positionInPage = highlightPosition - startPosition + 1;
      const rowRef = rowRefs.current[positionInPage];
      
      if (rowRef) {
        setTimeout(() => {
          rowRef.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add temporary highlight
          rowRef.classList.add('ring-2', 'ring-brand-500', 'ring-opacity-50');
          setTimeout(() => {
            rowRef.classList.remove('ring-2', 'ring-brand-500', 'ring-opacity-50');
          }, 3000);
        }, 100);
      }
    }
  }, [highlightPosition, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden" ref={tableRef}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <div className="col-span-6 sm:col-span-5 flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
                <div className="col-span-1 text-center hidden sm:block">
                  <Skeleton className="h-3 w-3 mx-auto" />
                </div>
                <div className="col-span-3 sm:col-span-2 text-right">
                  <Skeleton className="h-8 w-20 ml-auto" />
                </div>
              </div>
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
          description="No se encontraron usuarios en el ranking para los criterios seleccionados"
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden" ref={tableRef}>
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-1" role="columnheader">Pos.</div>
            <div className="col-span-6 sm:col-span-5" role="columnheader">Usuario</div>
            <div className="col-span-2 text-right" role="columnheader" aria-sort="descending">
              Puntos
            </div>
            <div className="col-span-1 text-center hidden sm:block" role="columnheader">
              Tend.
            </div>
            <div className="col-span-3 sm:col-span-2 text-right" role="columnheader">
              Acciones
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700" role="table">
          {data.map((row, index) => {
            const isTopThree = row.position <= 3;
            const startPosition = (currentPage - 1) * pageSize + 1;
            const isHighlighted = highlightPosition === row.position;
            const rowNumber = index + 1;
            
            return (
              <div
                key={`${row.userId}-${row.position}`}
                ref={(el) => {
                  rowRefs.current[rowNumber] = el;
                }}
                className={clsx(
                  'px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  isTopThree && 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10',
                  isHighlighted && 'bg-brand-50/50 dark:bg-brand-900/20'
                )}
                role="row"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Position */}
                  <div className="col-span-1" role="cell">
                    <Medal 
                      position={row.position} 
                      displayPosition={(row as any).displayPosition}
                    />
                  </div>

                  {/* User */}
                  <div className="col-span-6 sm:col-span-5 flex items-center space-x-3" role="cell">
                    <Avatar
                      src={row.profilePicUrl}
                      alt={`Avatar de ${row.username}`}
                      size="sm"
                      fallback={row.username[0]?.toUpperCase()}
                    />
                    <div className="min-w-0 flex-1">
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
                  <div className="col-span-2 text-right" role="cell">
                    <div className="flex items-center justify-end space-x-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {row.pointsTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="col-span-1 text-center hidden sm:block" role="cell">
                    <TrendIndicator trend={row.trend} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 sm:col-span-2 text-right" role="cell">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTeam(row.userId)}
                      disabled={!isDraftClosed}
                      className="text-xs"
                      aria-label={
                        isDraftClosed 
                          ? `Ver equipo de ${row.username}` 
                          : 'El draft está abierto, no se puede ver el equipo'
                      }
                      title={
                        isDraftClosed 
                          ? undefined 
                          : 'Los equipos se pueden ver solo cuando el draft está cerrado'
                      }
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