'use client';

import { Avatar, Button, Card } from '../../../shared/ui';
import { canSelectPlayer } from '../lib/validateDraft';
import type { Player } from '../../../entities/types';
import { clsx } from 'clsx';

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  selectedPlayers: Player[];
  onToggle: (player: Player) => void;
  disabled?: boolean;
}

export function PlayerCard({ 
  player, 
  isSelected, 
  selectedPlayers,
  onToggle, 
  disabled = false 
}: PlayerCardProps) {
  const { canSelect, reason } = canSelectPlayer(player, selectedPlayers);
  const isDisabled = disabled || (!isSelected && !canSelect);

  const handleClick = () => {
    if (isDisabled) return;
    onToggle(player);
  };

  return (
    <Card
      padding="md"
      className={clsx(
        'transition-all duration-200 cursor-pointer',
        isSelected && 'ring-2 ring-brand-500 border-brand-500 bg-brand-50 dark:bg-brand-900/20',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && !isSelected && 'hover:shadow-md hover:border-brand-200 dark:hover:border-brand-700'
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        {/* Player Info */}
        <div className="flex items-center space-x-3 flex-1">
          {/* Avatar */}
          <Avatar
            src={player.imageUrl}
            alt={player.nickname}
            size="md"
            fallback={player.nickname[0]?.toUpperCase()}
          />

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {player.nickname}
              </h3>
              {player.role && (
                <span className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  player.role === 'Entry' && 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
                  player.role === 'Flex' && 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
                  player.role === 'Support' && 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                )}>
                  {player.role}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 mt-1">
              {/* Team */}
              {player.Team && (
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
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

              {/* Region */}
              {player.region && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {player.region}
                </span>
              )}

              {/* Points */}
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {player.totalPoints}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="ml-3">
          <Button
            size="sm"
            variant={isSelected ? 'secondary' : 'primary'}
            onClick={handleClick}
            disabled={isDisabled}
            className="min-w-[80px]"
          >
            {isSelected ? 'Quitar' : 'Añadir'}
          </Button>
        </div>
      </div>

      {/* Disabled Reason */}
      {!canSelect && !isSelected && reason && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          {reason}
        </div>
      )}
    </Card>
  );
}