// src/features/admin/players/PlayerFormModal.tsx

'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button } from '../../../shared/ui';
import { PlayerSchema, type PlayerFormData, type AdminPlayer } from '../../../entities/admin/types';
import { useCreatePlayer, useUpdatePlayer, useAdminTeams } from '../hooks/useAdminApi';

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: AdminPlayer | null; // null for create, player object for edit
}

const ROLES = [
  { value: 'Entry', label: 'Entry' },
  { value: 'Flex', label: 'Flex' },
  { value: 'Support', label: 'Support' },
];

const REGIONS = [
  { value: 'EU', label: 'Europa' },
  { value: 'NA', label: 'Norte América' },
  { value: 'LATAM', label: 'Latinoamérica' },
  { value: 'APAC', label: 'Asia-Pacífico' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

export function PlayerFormModal({ isOpen, onClose, player }: PlayerFormModalProps) {
  const isEdit = !!player;
  const createPlayerMutation = useCreatePlayer();
  const updatePlayerMutation = useUpdatePlayer();
  
  // Get teams for dropdown
  const { data: teamsData } = useAdminTeams({ size: 100 }); // Get all teams
  
  const teamsOptions = useMemo(() => {
    return teamsData?.items.map(team => ({ 
      value: team.id, 
      label: team.name,
      region: team.region 
    })) || [];
  }, [teamsData]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(PlayerSchema),
    defaultValues: {
      nickname: '',
      role: 'Entry' as const,
      region: '',
      imageUrl: '',
      status: 'active' as const,
      teamId: undefined,
    },
  });

  // Reset form when modal opens/closes or player changes
  useEffect(() => {
    if (isOpen) {
      reset({
        nickname: player?.nickname || '',
        role: (player?.role as PlayerFormData['role']) || 'Entry',
        region: player?.region || '',
        imageUrl: player?.imageUrl || '',
        status: (player?.status as PlayerFormData['status']) || 'active',
        teamId: player?.teamId || undefined,
      });
    } else {
      reset({
        nickname: '',
        role: 'Entry' as const,
        region: '',
        imageUrl: '',
        status: 'active' as const,
        teamId: undefined,
      });
    }
  }, [isOpen, player, reset]);

  const onSubmit = async (data: PlayerFormData) => {
    try {
      if (isEdit && player) {
        await updatePlayerMutation.mutateAsync({
          id: player.id,
          ...data,
        });
      } else {
        await createPlayerMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('¿Seguro que quieres cerrar? Los cambios se perderán.')) {
      return;
    }
    onClose();
  };

  // Watch values for dynamic behavior
  const watchedImageUrl = watch('imageUrl');
  const watchedTeamId = watch('teamId');
  const watchedRegion = watch('region');

  // Auto-fill region when team is selected
  useEffect(() => {
    if (watchedTeamId && !isEdit) { // Only auto-fill when creating new players
      const selectedTeam = teamsOptions.find(t => t.value === watchedTeamId);
      if (selectedTeam && selectedTeam.region !== watchedRegion) {
        setValue('region', selectedTeam.region);
      }
    }
  }, [watchedTeamId, teamsOptions, setValue, isEdit, watchedRegion]);

  const mutation = isEdit ? updatePlayerMutation : createPlayerMutation;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? `Editar jugador: ${player?.nickname}` : 'Crear nuevo jugador'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Player Nickname */}
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nickname *
          </label>
          <input
            id="nickname"
            type="text"
            {...register('nickname')}
            placeholder="Ej: Shaiiko"
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.nickname ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          />
          {errors.nickname && (
            <p className="mt-1 text-sm text-red-600">{errors.nickname.message}</p>
          )}
        </div>

        {/* Team Selection */}
        <div>
          <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Equipo (opcional)
          </label>
          <select
            id="teamId"
            {...register('teamId', { 
              setValueAs: (value) => value === '' ? undefined : parseInt(value, 10)