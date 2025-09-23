// src/features/admin/config/AdminConfigForm.tsx

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card } from '../../../shared/ui';
import { AdminConfigSchema, type AdminConfigFormData } from '../../../entities/admin/types';
import { useAdminConfig, useUpdateConfig } from '../hooks/useAdminApi';

export function AdminConfigForm() {
  const { data: config, isLoading: configLoading, error } = useAdminConfig();
  const updateConfigMutation = useUpdateConfig();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    reset,
  } = useForm<AdminConfigFormData>({
    resolver: zodResolver(AdminConfigSchema),
    defaultValues: config ? {
      activePhase: config.activePhase,
      draftGruposOpen: config.draftGruposOpen,
      draftPlayoffsOpen: config.draftPlayoffsOpen,
      redraftOpensAt: config.redraftOpensAt ? 
        new Date(config.redraftOpensAt).toISOString().slice(0, 16) : 
        undefined,
    } : undefined,
  });

  // Update form when config loads
  useEffect(() => {
    if (config) {
      reset({
        activePhase: config.activePhase,
        draftGruposOpen: config.draftGruposOpen,
        draftPlayoffsOpen: config.draftPlayoffsOpen,
        redraftOpensAt: config.redraftOpensAt ? 
          new Date(config.redraftOpensAt).toISOString().slice(0, 16) : 
          undefined,
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: AdminConfigFormData) => {
    try {
      await updateConfigMutation.mutateAsync({
        activePhase: data.activePhase,
        draftGruposOpen: data.draftGruposOpen,
        draftPlayoffsOpen: data.draftPlayoffsOpen,
        redraftOpensAt: data.redraftOpensAt ? 
          new Date(data.redraftOpensAt).toISOString() : 
          undefined,
      });
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  // Watch values for real-time validation feedback
  const watchedValues = watch();

  if (configLoading) {
    return (
      <Card padding="lg">
        <div className="animate-pulse space-y-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error al cargar configuración
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No se pudo cargar la configuración del sistema
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Active Phase */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fase Activa
          </label>
          <select
            {...register('activePhase')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="group">Grupos</option>
            <option value="playoffs">Playoffs</option>
          </select>
          {errors.activePhase && (
            <p className="mt-1 text-sm text-red-600">{errors.activePhase.message}</p>
          )}
        </div>

        {/* Draft Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Estado de los Drafts
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('draftGruposOpen')}
                className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Draft de Grupos abierto
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('draftPlayoffsOpen')}
                className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Draft de Playoffs abierto
              </span>
            </label>
          </div>

          {/* Validation Warning */}
          {!watchedValues.draftGruposOpen && !watchedValues.draftPlayoffsOpen && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Advertencia
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Al menos una fase de draft debe estar abierta
                  </p>
                </div>
              </div>
            </div>
          )}

          {errors.draftGruposOpen && (
            <p className="text-sm text-red-600">{errors.draftGruposOpen.message}</p>
          )}
        </div>

        {/* Redraft Timing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Redraft abre en (opcional)
          </label>
          <input
            type="datetime-local"
            {...register('redraftOpensAt')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {errors.redraftOpensAt && (
            <p className="mt-1 text-sm text-red-600">{errors.redraftOpensAt.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fecha y hora para abrir el próximo redraft (debe ser futura)
          </p>
        </div>

        {/* Current Status Display */}
        {config && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Estado Actual
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Fase Activa:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {config.activePhase === 'group' ? 'Grupos' : 'Playoffs'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Draft Grupos:</span>
                <span className={`ml-2 font-medium ${config.draftGruposOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {config.draftGruposOpen ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Draft Playoffs:</span>
                <span className={`ml-2 font-medium ${config.draftPlayoffsOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {config.draftPlayoffsOpen ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </div>
            {config.redraftOpensAt && (
              <div className="mt-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Próximo Redraft:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {new Date(config.redraftOpensAt).toLocaleString('es-ES')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isDirty && (
              <span className="text-sm text-yellow-600 dark:text-yellow-400">
                Cambios sin guardar
              </span>
            )}
          </div>
          <Button
            type="submit"
            loading={updateConfigMutation.isPending}
            disabled={!isValid || !isDirty}
          >
            {updateConfigMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Card>
  );
}