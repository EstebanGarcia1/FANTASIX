// src/features/admin/matches/CloseMatchModal.tsx

'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button } from '../../../shared/ui';
import { CloseMatchSchema, type CloseMatchFormData, type AdminMatch } from '../../../entities/admin/types';
import { useCloseMatch } from '../hooks/useAdminApi';

interface CloseMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: AdminMatch | null;
}

export function CloseMatchModal({ isOpen, onClose, match }: CloseMatchModalProps) {
  const closeMatchMutation = useCloseMatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<CloseMatchFormData>({
    resolver: zodResolver(CloseMatchSchema),
    defaultValues: {
      scoreA: 0,
      scoreB: 0,
      winnerTeamId: undefined,
      mapScores: [],
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && match) {
      reset({
        scoreA: 0,
        scoreB: 0,
        winnerTeamId: undefined,
        mapScores: [],
      });
    }
  }, [isOpen, match, reset]);

  const watchedScoreA = watch('scoreA');
  const watchedScoreB = watch('scoreB');

  // Auto-determine winner based on scores
  useEffect(() => {
    if (match && watchedScoreA !== undefined && watchedScoreB !== undefined) {
      if (watchedScoreA > watchedScoreB) {
        setValue('winnerTeamId', match.teamAId);
      } else if (watchedScoreB > watchedScoreA) {
        setValue('winnerTeamId', match.teamBId);
      } else {
        setValue('winnerTeamId', undefined);
      }
    }
  }, [watchedScoreA, watchedScoreB, match, setValue]);

  const onSubmit = async (data: CloseMatchFormData) => {
    if (!match) return;

    try {
      await closeMatchMutation.mutateAsync({
        matchId: match.id,
        ...data,
      });
      onClose();
    } catch (error) {
      console.error('Error closing match:', error);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('¿Seguro que quieres cerrar sin finalizar el partido?')) {
      return;
    }
    onClose();
  };

  // Validate scores based on format
  const validateScores = useMemo(() => {
    if (!match || watchedScoreA === undefined || watchedScoreB === undefined) {
      return { isValid: false, message: '' };
    }

    const maxScore = match.format === 'BO1' ? 1 : match.format === 'BO3' ? 2 : 3;
    const minWinningScore = match.format === 'BO1' ? 1 : match.format === 'BO3' ? 2 : 3;

    // Check if scores are within valid range
    if (watchedScoreA > maxScore || watchedScoreB > maxScore) {
      return { 
        isValid: false, 
        message: `El marcador máximo para ${match.format} es ${maxScore}` 
      };
    }

    // Check if there's a clear winner
    if (watchedScoreA !== watchedScoreB) {
      const winner = Math.max(watchedScoreA, watchedScoreB);
      const loser = Math.min(watchedScoreA, watchedScoreB);
      
      if (winner >= minWinningScore) {
        return { isValid: true, message: '' };
      } else {
        return { 
          isValid: false, 
          message: `Para ganar en ${match.format} se necesitan al menos ${minWinningScore} puntos` 
        };
      }
    } else {
      return { 
        isValid: false, 
        message: 'Los marcadores no pueden ser iguales en un partido finalizado' 
      };
    }
  }, [match, watchedScoreA, watchedScoreB]);

  if (!match) return null;

  const winnerTeam = watchedScoreA > watchedScoreB ? match.teamA : watchedScoreB > watchedScoreA ? match.teamB : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Finalizar partido: ${match.teamA.name} vs ${match.teamB.name}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Match Info Header */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {match.teamA.name} vs {match.teamB.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-x-4">
              <span>Formato: {match.format}</span>
              {match.round && <span>• {match.round}</span>}
              <span>• {new Date(match.scheduledTime).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        {/* Score Input */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Resultado Final
          </h3>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Team A Score */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {match.teamA.logoUrl && (
                  <img className="h-8 w-8 rounded-full object-cover mr-2" src={match.teamA.logoUrl} alt={match.teamA.name} />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  {match.teamA.name}
                </span>
              </div>
              <input
                type="number"
                min="0"
                max={match.format === 'BO1' ? 1 : match.format === 'BO3' ? 2 : 3}
                {...register('scoreA', { valueAsNumber: true })}
                className={`w-full text-center text-2xl font-bold py-3 rounded-lg border-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white ${
                  errors.scoreA 
                    ? 'border-red-300 focus:border-red-500' 
                    : winnerTeam === match.teamA
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                      : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
              />
              {winnerTeam === match.teamA && (
                <div className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                  ✅ Ganador
                </div>
              )}
            </div>

            {/* VS Separator */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                VS
              </div>
            </div>

            {/* Team B Score */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {match.teamB.logoUrl && (
                  <img className="h-8 w-8 rounded-full object-cover mr-2" src={match.teamB.logoUrl} alt={match.teamB.name} />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  {match.teamB.name}
                </span>
              </div>
              <input
                type="number"
                min="0"
                max={match.format === 'BO1' ? 1 : match.format === 'BO3' ? 2 : 3}
                {...register('scoreB', { valueAsNumber: true })}
                className={`w-full text-center text-2xl font-bold py-3 rounded-lg border-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white ${
                  errors.scoreB 
                    ? 'border-red-300 focus:border-red-500' 
                    : winnerTeam === match.teamB
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                      : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
              />
              {winnerTeam === match.teamB && (
                <div className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                  ✅ Ganador
                </div>
              )}
            </div>
          </div>

          {/* Score Validation Messages */}
          {!validateScores.isValid && validateScores.message && (
            <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {validateScores.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Format Guide */}
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              <strong>{match.format}</strong>: 
              {match.format === 'BO1' && ' Primer equipo en llegar a 1 punto gana'}
              {match.format === 'BO3' && ' Primer equipo en llegar a 2 puntos gana'}
              {match.format === 'BO5' && ' Primer equipo en llegar a 3 puntos gana'}
            </p>
          </div>
        </div>

        {/* Hidden Winner Field */}
        <input type="hidden" {...register('winnerTeamId')} />

        {/* Impact Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Impacto de finalizar el partido:
              </h3>
              <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                <li>Se calcularan automáticamente los puntos fantasy</li>
                <li>Se actualizarán las estadísticas de los jugadores</li>
                <li>Se refrescará el leaderboard global</li>
                <li>Los cambios son <strong>irreversibles</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {winnerTeam && (
              <span className="text-sm text-green-600 dark:text-green-400">
                🏆 Ganador: {winnerTeam.name}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={closeMatchMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={closeMatchMutation.isPending}
              disabled={!validateScores.isValid || !isDirty}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              {closeMatchMutation.isPending ? 'Finalizando...' : 'Finalizar Partido'}
            </Button>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
            <div>Valid: {isValid ? '✅' : '❌'}</div>
            <div>Scores Valid: {validateScores.isValid ? '✅' : '❌'}</div>
            <div>Winner: {winnerTeam?.name || 'None'}</div>
            <div>Dirty: {isDirty ? '✅' : '❌'}</div>
          </div>
        )}
      </form>
    </Modal>
  );
}