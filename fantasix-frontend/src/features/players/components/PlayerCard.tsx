'use client';

import Link from 'next/link';
import { Avatar, Button } from '../../../shared/ui';
import type { PlayerCardProps } from '../../../entities/players/types';
import { clsx } from 'clsx';

export function PlayerCard({ 
  player, 
  viewMode, 
  isDraftOpen, 
  isSelected = false, 
  canSelect = true,
  onDraftAction,
  disabled = false 
}: PlayerCardProps) {
  const handleDraftAction = () => {
    if (!onDraftAction || disabled || !isDraftOpen) return;
    
    onDraftAction({
      playerId: player.id,
      action: isSelected ? 'remove' : 'add',
      player,
    });
  };

  const roleColors = {
    Entry: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    Flex: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Support: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  };

  if (viewMode === 'table') {
    return (
      <div className={clsx(
        'flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow',
        isSelected && 'ring-2 ring-brand-500 border-brand-500',
        disabled && 'opacity-50'
      )}>
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Avatar and basic info */}
          <div className="flex items-center space-x-3 min-w-0">
            <Avatar
              src={player.imageUrl}
              alt={player.nickname}
              size="md"
              fallback={player.nickname[0]?.toUpperCase()}
            />
            <div className="min-w-0">
              <Link
                href={`/app/players/${player.id}`}
                className="block font-medium text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 truncate"
              >
                {player.nickname}
              </Link>
              {player.realName && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {player.realName}
                </p>
              )}
            </div>
          </div>

          {/* Team info */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
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
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {player.Team.name}
            </span>
          </div>

          {/* Role */}
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded text-xs font-medium flex-shrink-0',
            roleColors[player.role]
          )}>
            {player.role}
          </span>

          {/* Region */}
          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
            {player.region}
          </span>

          {/* Points */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {player.stats.currentPhasePoints}
            </span>
          </div>
        </div>

        {/* Action button */}
        {isDraftOpen && onDraftAction && (
          <Button
            size="sm"
            variant={isSelected ? 'secondary' : 'primary'}
            onClick={handleDraftAction}
            disabled={disabled || (!canSelect && !isSelected)}
            className="ml-4"
          >
            {isSelected ? 'Quitar' : 'Añadir'}
          </Button>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200',
      isSelected && 'ring-2 ring-brand-500 border-brand-500 bg-brand-50 dark:bg-brand-900/20',
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      {/* Header with avatar and basic info */}
      <div className="flex items-center space-x-4 mb-4">
        <Avatar
          src={player.imageUrl}
          alt={player.nickname}
          size="lg"
          fallback={player.nickname[0]?.toUpperCase()}
        />
        <div className="flex-1 min-w-0">
          <Link
            href={`/app/players/${player.id}`}
            className="block text-lg font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 truncate"
          >
            {player.nickname}
          </Link>
          {player.realName && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {player.realName}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <span className={clsx(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              roleColors[player.role]
            )}>
              {player.role}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {player.region}
            </span>
          </div>
        </div>
      </div>

      {/* Team info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
          {player.Team.logoUrl ? (
            <img
              src={player.Team.logoUrl}
              alt={player.Team.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-gray-500">
              {player.Team.name[0]}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {player.Team.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {player.Team.region}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Puntos actuales
          </span>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {player.stats.currentPhasePoints}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Promedio por partido
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {player.stats.averagePointsPerGame.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Partidos jugados
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {player.stats.gamesPlayed}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Link href={`/app/players/${player.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            Ver perfil
          </Button>
        </Link>
        
        {isDraftOpen && onDraftAction && (
          <Button
            variant={isSelected ? 'secondary' : 'primary'}
            onClick={handleDraftAction}
            disabled={disabled || (!canSelect && !isSelected)}
            className="flex-1"
          >
            {isSelected ? 'Quitar' : 'Añadir'}
          </Button>
        )}
      </div>
    </div>
  );
}