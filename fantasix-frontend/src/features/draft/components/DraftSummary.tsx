'use client';

import { Avatar, Button, Card } from '../../../shared/ui';
import { RoleRequirements } from './RoleRequirements';
import { TeamCounter } from './TeamCounter';
import { validateDraft } from '../lib/validateDraft';
import type { Player } from '../../../entities/types';
import { clsx } from 'clsx';

interface DraftSummaryProps {
  selectedPlayers: Player[];
  allPlayers: Player[];
  onRemovePlayer: (player: Player) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function DraftSummary({
  selectedPlayers,
  allPlayers,
  onRemovePlayer,
  onConfirm,
  isSubmitting = false,
  disabled = false,
}: DraftSummaryProps) {
  const selectedIds = selectedPlayers.map(p => p.id.toString());
  const validation = validateDraft(allPlayers, selectedIds);

  // Create 5 slots for the team
  const teamSlots = Array(5).fill(null).map((_, index) => {
    return selectedPlayers[index] || null;
  });

  return (
    <div className="space-y-4">
      {/* Team Slots */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mi Equipo ({selectedPlayers.length}/5)
        </h3>

        <div className="space-y-3">
          {teamSlots.map((player, index) => (
            <div
              key={index}
              className={clsx(
                'flex items-center justify-between p-3 rounded-lg border-2 border-dashed',
                player
                  ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
              )}
            >
              {player ? (
                <>
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={player.imageUrl}
                      alt={player.nickname}
                      size="sm"
                      fallback={player.nickname[0]?.toUpperCase()}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {player.nickname}
                        </span>
                        {player.role && (
                          <span className={clsx(
                            'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                            player.role === 'Entry' && 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
                            player.role === 'Flex' && 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
                            player.role === 'Support' && 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          )}>
                            {player.role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        {player.Team && <span>{player.Team.name}</span>}
                        <span>•</span>
                        <span>{player.totalPoints} pts</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemovePlayer(player)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <span className="text-sm">Slot vacío</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total Points */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Puntos totales:
            </span>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedPlayers.reduce((total, player) => total + player.totalPoints, 0)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Role Requirements */}
      <RoleRequirements selectedPlayers={selectedPlayers} />

      {/* Team Counter */}
      <TeamCounter selectedPlayers={selectedPlayers} />

      {/* Validation Errors */}
      {!validation.valid && selectedPlayers.length > 0 && (
        <Card padding="md" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Problemas con el equipo:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span>•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Confirm Button */}
      <Button
        onClick={onConfirm}
        disabled={!validation.valid || disabled || isSubmitting}
        loading={isSubmitting}
        className="w-full"
        size="lg"
      >
        {validation.valid ? 'Confirmar Equipo' : 'Completa tu equipo'}
      </Button>
    </div>
  );
}