// src/features/admin/matches/MatchesSection.tsx

'use client';

import { useState } from 'react';
import { Button, Card, LoadingSpinner, EmptyState } from '../../../shared/ui';
import { useAdminMatches, useDeleteMatch } from '../hooks/useAdminApi';
import { MatchFormModal } from './MatchFormModal';
import { CloseMatchModal } from './CloseMatchModal';
import type { AdminMatch, MatchFilters } from '../../../entities/admin/types';

interface MatchesSectionProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
}

const MATCH_TABS = [
  { key: 'upcoming', label: 'Próximos', icon: '📅' },
  { key: 'recent', label: 'Finalizados', icon: '✅' },
] as const;

export function MatchesSection({ filters, onFiltersChange }: MatchesSectionProps) {
  const [selectedMatch, setSelectedMatch] = useState<AdminMatch | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const { data: matchesData, isLoading, error, refetch } = useAdminMatches(filters);
  const deleteMatchMutation = useDeleteMatch();

  const handleScopeChange = (scope: 'upcoming' | 'recent') => {
    onFiltersChange({
      ...filters,
      scope,
      page: 1, // Reset to first page
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value || undefined,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    onFiltersChange({
      ...filters,
      page: newPage,
    });
  };

  const handleEdit = (match: AdminMatch) => {
    setSelectedMatch(match);
    setIsEditModalOpen(true);
  };

  const handleCloseMatch = (match: AdminMatch) => {
    if (match.status !== 'scheduled') {
      return;
    }
    setSelectedMatch(match);
    setIsCloseModalOpen(true);
  };

  const handleDelete = async (match: AdminMatch) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar el partido ${match.teamA.name} vs ${match.teamB.name}?\n\nEsto puede afectar:\n- Estadísticas de jugadores\n- Puntos fantasy calculados\n- Historial de partidos`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteMatchMutation.mutateAsync(match.id);
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    }
  };

  const handleModalClose = () => {
    setSelectedMatch(null);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsCloseModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'finished':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'in_progress':
        return 'En Curso';
      case 'finished':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

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
            Error al cargar partidos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No se pudieron cargar los partidos
          </p>
          <Button onClick={refetch}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Match Type Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {MATCH_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleScopeChange(tab.key as 'upcoming' | 'recent')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                filters.scope === tab.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear Partido
        </Button>
      </div>

      {/* Search */}
      <Card padding="md">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="sr-only">
              Buscar partidos
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Buscar por equipos..."
                value={filters.search || ''}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          {filters.search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, search: undefined, page: 1 })}
            >
              Limpiar
            </Button>
          )}
        </div>
      </Card>

      {/* Matches List */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    <div className="flex items-center space-x-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : matchesData?.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={filters.scope === 'upcoming' ? "No hay partidos programados" : "No hay partidos finalizados"}
              description={
                filters.search
                  ? "No se encontraron partidos con ese criterio de búsqueda"
                  : filters.scope === 'upcoming'
                    ? "Los próximos partidos aparecerán aquí cuando sean programados"
                    : "Los partidos finalizados aparecerán aquí"
              }
              action={
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Crear primer partido
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {matchesData?.items.map((match) => (
                <div key={match.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {/* Match Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {match.round && `${match.round} • `}
                        {match.format}
                      </span>
                      {match.phase && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {match.phase}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                        {getStatusLabel(match.status)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        #{match.id}
                      </span>
                    </div>
                  </div>

                  {/* Teams and Score */}
                  <div className="flex items-center justify-between">
                    {/* Team A */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10">
                        {match.teamA.logoUrl ? (
                          <img className="w-10 h-10 rounded-full object-cover" src={match.teamA.logoUrl} alt={match.teamA.name} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {match.teamA.name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {match.teamA.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {match.teamA.region}
                        </div>
                      </div>
                    </div>

                    {/* Score or Time */}
                    <div className="flex items-center space-x-4">
                      {match.status === 'finished' ? (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {match.scoreA} - {match.scoreB}
                          </div>
                          {match.winnerTeamId && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Victoria {match.winnerTeamId === match.teamA.id ? match.teamA.name : match.teamB.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(match.scheduledTime).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(match.scheduledTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Team B */}
                    <div className="flex items-center space-x-3 flex-1 justify-end">