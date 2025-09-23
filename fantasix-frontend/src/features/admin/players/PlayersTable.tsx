// src/features/admin/players/PlayersTable.tsx

'use client';

import { useState, useMemo } from 'react';
import { Button, Card, LoadingSpinner, EmptyState } from '../../../shared/ui';
import { useAdminPlayers, useDeletePlayer, useAdminTeams } from '../hooks/useAdminApi';
import { PlayerFormModal } from './PlayerFormModal';
import type { AdminPlayer, PlayerFilters } from '../../../entities/admin/types';

interface PlayersTableProps {
  filters: PlayerFilters;
  onFiltersChange: (filters: PlayerFilters) => void;
}

const ROLES = [
  { value: 'Entry', label: 'Entry', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' },
  { value: 'Flex', label: 'Flex', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200' },
  { value: 'Support', label: 'Support', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' },
];

const REGIONS = [
  { value: 'EU', label: 'Europa' },
  { value: 'NA', label: 'Norte América' },
  { value: 'LATAM', label: 'Latinoamérica' },
  { value: 'APAC', label: 'Asia-Pacífico' },
];

export function PlayersTable({ filters, onFiltersChange }: PlayersTableProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<AdminPlayer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: playersData, isLoading, error, refetch } = useAdminPlayers(filters);
  const { data: teamsData } = useAdminTeams({ size: 100 }); // Get all teams for filter
  const deletePlayerMutation = useDeletePlayer();

  // Create teams options for filter
  const teamsOptions = useMemo(() => {
    return teamsData?.items.map(team => ({ value: team.id, label: team.name })) || [];
  }, [teamsData]);

  const handleFilterChange = (key: keyof PlayerFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
      page: 1, // Reset to first page when changing filters
    });
  };

  const handlePageChange = (newPage: number) => {
    onFiltersChange({
      ...filters,
      page: newPage,
    });
  };

  const handleEdit = (player: AdminPlayer) => {
    setSelectedPlayer(player);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (player: AdminPlayer) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar al jugador "${player.nickname}"?\n\nEsto puede afectar:\n- Equipos fantasy que lo incluyen\n- Estadísticas históricas\n- Resultados de partidos`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deletePlayerMutation.mutateAsync(player.id);
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  const handleModalClose = () => {
    setSelectedPlayer(null);
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  };

  const getRoleColor = (role: string) => {
    return ROLES.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-800';
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
            Error al cargar jugadores
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No se pudieron cargar los jugadores
          </p>
          <Button onClick={refetch}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
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
                placeholder="Buscar por nickname..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Team Filter */}
          <div>
            <label htmlFor="team-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Equipo
            </label>
            <select
              id="team-filter"
              value={filters.teamId || ''}
              onChange={(e) => handleFilterChange('teamId', e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos los equipos</option>
              {teamsOptions.map((team) => (
                <option key={team.value} value={team.value}>
                  {team.label}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <select
              id="role-filter"
              value={filters.role || ''}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos los roles</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Región
            </label>
            <select
              id="region-filter"
              value={filters.region || ''}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todas las regiones</option>
              {REGIONS.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Active Filters & Clear */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {(filters.search || filters.teamId || filters.role || filters.region || filters.status) && (
              <>
                <span>Filtros activos:</span>
                {filters.search && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">"{filters.search}"</span>}
                {filters.teamId && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">Equipo: {teamsOptions.find(t => t.value === filters.teamId)?.label}</span>}
                {filters.role && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">Rol: {filters.role}</span>}
                {filters.region && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">Región: {filters.region}</span>}
                {filters.status && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">Estado: {filters.status}</span>}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onFiltersChange({ page: 1, size: filters.size })}
                  className="ml-2"
                >
                  Limpiar filtros
                </Button>
              </>
            )}
          </div>
          
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear Jugador
          </Button>
        </div>
      </Card>

      {/* Players Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : playersData?.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No hay jugadores"
              description={
                Object.values(filters).some(v => v !== undefined && v !== 1 && v !== 20) 
                  ? "No se encontraron jugadores con los filtros aplicados"
                  : "Aún no hay jugadores creados"
              }
              action={
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Crear primer jugador
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Jugador
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Región
                    </th>
                    <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Puntos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {playersData?.items.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {player.imageUrl ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={player.imageUrl} alt={player.nickname} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {player.nickname[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {player.nickname}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {player.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {player.team ? (
                          <div className="flex items-center">
                            {player.team.logoUrl && (
                              <img className="h-6 w-6 rounded-full object-cover mr-2" src={player.team.logoUrl} alt={player.team.name} />
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {player.team.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 italic">Sin equipo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(player.role)}`}>
                          {player.role}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {player.region}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {player.totalPoints.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          player.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            player.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          {player.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(player)}
                            className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-200"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(player)}
                            disabled={deletePlayerMutation.isPending}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {playersData && playersData.totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={!playersData.page || playersData.page <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={playersData.page >= playersData.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando{' '}
                      <span className="font-medium">{((playersData.page - 1) * playersData.size) + 1}</span>{' '}
                      a{' '}
                      <span className="font-medium">{Math.min(playersData.page * playersData.size, playersData.total)}</span>{' '}
                      de{' '}
                      <span className="font-medium">{playersData.total}</span>{' '}
                      jugadores
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(playersData.page - 1)}
                        disabled={playersData.page <= 1}
                        className="rounded-l-md"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(playersData.page + 1)}
                        disabled={playersData.page >= playersData.totalPages}
                        className="rounded-r-md"
                      >
                        Siguiente
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      <PlayerFormModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        player={null}
      />

      <PlayerFormModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        player={selectedPlayer}
      />
    </div>
  );
}