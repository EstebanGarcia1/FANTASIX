// src/features/admin/matches/MatchFormModal.tsx

'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button } from '../../../shared/ui';
import { MatchSchema, type MatchFormData, type AdminMatch } from '../../../entities/admin/types';
import { useCreateMatch, useUpdateMatch, useAdminTeams } from '../hooks/useAdminApi';

interface MatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: AdminMatch | null; // null for create, match object for edit
}

const FORMATS = [
  { value: 'BO1', label: 'Best of 1' },
  { value: 'BO3', label: 'Best of 3' },
  { value: 'BO5', label: 'Best of 5' },
];

export function MatchFormModal({ isOpen, onClose, match }: MatchFormModalProps) {
  const isEdit = !!match;
  const createMatchMutation = useCreateMatch();
  const updateMatchMutation = useUpdateMatch();
  
  // Get teams for dropdowns
  const { data: teamsData } = useAdminTeams({ size: 100 }); // Get all teams
  
  const teamsOptions = useMemo(() => {
    return teamsData?.items.map(team => ({ 
      value: team.id, 
      label: `${team.name} (${team.region})`,
      name: team.name,
      region: team.region
    })) || [];
  }, [teamsData]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<MatchFormData>({
    resolver: zodResolver(MatchSchema),
    defaultValues: {
      tournamentId: undefined,
      teamAId: undefined,
      teamBId: undefined,
      scheduledTime: '',
      format: 'BO3' as const,
      round: '',
      phase: '',
    },
  });

  // Reset form when modal opens/closes or match changes
  useEffect(() => {
    if (isOpen) {
      if (match) {
        // Convert UTC datetime to local datetime-local format
        const scheduledTime = new Date(match.scheduledTime).toISOString().slice(0, 16);
        
        reset({
          tournamentId: match.tournamentId || undefined,
          teamAId: match.teamAId,
          teamBId: match.teamBId,
          scheduledTime: scheduledTime,
          format: match.format as MatchFormData['format'],
          round: match.round || '',
          phase: match.phase || '',
        });
      } else {
        // For new matches, set default time to 1 hour from now
        const defaultTime = new Date();
        defaultTime.setHours(defaultTime.getHours() + 1);
        
        reset({
          tournamentId: undefined,
          teamAId: undefined,
          teamBId: undefined,
          scheduledTime: defaultTime.toISOString().slice(0, 16),
          format: 'BO3' as const,
          round: '',
          phase: '',
        });
      }
    }
  }, [isOpen, match, reset]);

  const onSubmit = async (data: MatchFormData) => {
    try {
      // Convert local datetime to UTC ISO string
      const submitData = {
        ...data,
        scheduledTime: new Date(data.scheduledTime).toISOString(),
      };

      if (isEdit && match) {
        await updateMatchMutation.mutateAsync({
          id: match.id,
          ...submitData,
        });
      } else {
        await createMatchMutation.mutateAsync(submitData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('¿Seguro que quieres cerrar? Los cambios se perderán.')) {
      return;
    }
    onClose();
  };

  // Watch team selections for validation
  const watchedTeamA = watch('teamAId');
  const watchedTeamB = watch('teamBId');
  const watchedScheduledTime = watch('scheduledTime');

  // Get team names for display
  const teamAName = teamsOptions.find(t => t.value === watchedTeamA)?.name;
  const teamBName = teamsOptions.find(t => t.value === watchedTeamB)?.name;

  const mutation = isEdit ? updateMatchMutation : createMatchMutation;

  // Check if scheduled time is in the past
  const isPastTime = watchedScheduledTime && new Date(watchedScheduledTime) < new Date();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? `Editar partido: ${teamAName} vs ${teamBName}` : 'Crear nuevo partido'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Team Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team A */}
          <div>
            <label htmlFor="teamAId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Equipo A *
            </label>
            <select
              id="teamAId"
              {...register('teamAId', { 
                setValueAs: (value) => value === '' ? undefined : parseInt(value, 10) 
              })}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.teamAId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            >
              <option value="">Seleccionar equipo A</option>
              {teamsOptions.map((team) => (
                <option 
                  key={team.value} 
                  value={team.value}
                  disabled={team.value === watchedTeamB}
                >
                  {team.label}
                </option>
              ))}
            </select>
            {errors.teamAId && (
              <p className="mt-1 text-sm text-red-600">{errors.teamAId.message}</p>
            )}
          </div>

          {/* Team B */}
          <div>
            <label htmlFor="teamBId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Equipo B *
            </label>
            <select
              id="teamBId"
              {...register('teamBId', { 
                setValueAs: (value) => value === '' ? undefined : parseInt(value, 10) 
              })}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.teamBId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            >
              <option value="">Seleccionar equipo B</option>
              {teamsOptions.map((team) => (
                <option 
                  key={team.value} 
                  value={team.value}
                  disabled={team.value === watchedTeamA}
                >
                  {team.label}
                </option>
              ))}
            </select>
            {errors.teamBId && (
              <p className="mt-1 text-sm text-red-600">{errors.teamBId.message}</p>
            )}
          </div>
        </div>

        {/* Same team validation warning */}
        {watchedTeamA && watchedTeamB && watchedTeamA === watchedTeamB && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Los equipos A y B deben ser diferentes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Match Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scheduled Time */}
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha y Hora *
            </label>
            <input
              id="scheduledTime"
              type="datetime-local"
              {...register('scheduledTime')}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.scheduledTime ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {errors.scheduledTime && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledTime.message}</p>
            )}
            {isPastTime && (
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ La fecha seleccionada está en el pasado
              </p>
            )}
          </div>

          {/* Format */}
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato *
            </label>
            <select
              id="format"
              {...register('format')}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.format ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            >
              {FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            {errors.format && (
              <p className="mt-1 text-sm text-red-600">{errors.format.message}</p>
            )}
          </div>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Round */}
          <div>
            <label htmlFor="round" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ronda (opcional)
            </label>
            <input
              id="round"
              type="text"
              {...register('round')}
              placeholder="Ej: Cuartos de Final"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Phase */}
          <div>
            <label htmlFor="phase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fase (opcional)
            </label>
            <input
              id="phase"
              type="text"
              {...register('phase')}
              placeholder="Ej: Grupos, Playoffs"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Tournament ID (Hidden for now) */}
        <input type="hidden" {...register('tournamentId')} />

        {/* Match Preview */}
        {watchedTeamA && watchedTeamB && teamAName && teamBName && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Vista previa del partido:
            </h4>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {teamAName} vs {teamBName}
              </div>
              {watchedScheduledTime && (
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {new Date(watchedScheduledTime).toLocaleString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {isDirty && (
              <span className="text-sm text-yellow-600 dark:text-yellow-400">
                Cambios sin guardar
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={!isValid || (!isDirty && !isEdit)}
            >
              {mutation.isPending 
                ? (isEdit ? 'Actualizando...' : 'Creando...') 
                : (isEdit ? 'Actualizar' : 'Crear')
              }
            </Button>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
            <div>Valid: {isValid ? '✅' : '❌'}</div>
            <div>Dirty: {isDirty ? '✅' : '❌'}</div>
            <div>Errors: {Object.keys(errors).length}</div>
            <div>Teams loaded: {teamsOptions.length}</div>
          </div>
        )}
      </form>
    </Modal>
  );
}