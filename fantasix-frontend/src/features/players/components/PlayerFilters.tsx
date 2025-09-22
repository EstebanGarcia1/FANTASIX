'use client';

import { useState } from 'react';
import { Input, Button, Card } from '../../../shared/ui';
import { useTeams } from '../../../shared/api/hooks';
import type { PlayerFilters, PlayerViewMode } from '../../../entities/players/types';
import { clsx } from 'clsx';

interface PlayerFiltersProps {
  filters: PlayerFilters;
  onFiltersChange: (filters: PlayerFilters) => void;
  viewMode: PlayerViewMode;
  onViewModeChange: (mode: PlayerViewMode) => void;
  availableRegions?: string[];
  isLoading?: boolean;
  totalResults?: number;
}

export function PlayerFilters({ 
  filters, 
  onFiltersChange,
  viewMode,
  onViewModeChange,
  availableRegions = [],
  isLoading = false,
  totalResults = 0
}: PlayerFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const { data: teams = [] } = useTeams();

  const handleRoleChange = (role: string) => {
    onFiltersChange({
      ...filters,
      role: role === 'all' ? undefined : role as 'Entry' | 'Flex' | 'Support',
      page: 1, // Reset to first page when filtering
    });
  };

  const handleTeamChange = (teamId: string) => {
    onFiltersChange({
      ...filters,
      teamId: teamId === 'all' ? undefined : parseInt(teamId),
      page: 1,
    });
  };

  const handleRegionChange = (region: string) => {
    onFiltersChange({
      ...filters,
      region: region === 'all' ? undefined : region,
      page: 1,
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as 'points' | 'name' | 'team',
      page: 1,
    });
  };

  const handleSortOrderChange = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      search: localSearch.trim() || undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      sortBy: 'points',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.role || filters.teamId || filters.region || filters.search;

  return (
    <Card padding="md" className="space-y-6">
      {/* Header with view mode toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros de Jugadores
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalResults} jugadores encontrados
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              )}
              aria-pressed={viewMode === 'grid'}
              aria-label="Vista en cuadrícula"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              )}
              aria-pressed={viewMode === 'table'}
              aria-label="Vista en tabla"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              disabled={isLoading}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar jugador
          </label>
          <form onSubmit={handleSearchSubmit} className="flex">
            <Input
              type="text"
              placeholder="Nombre, nick o equipo..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              disabled={isLoading}
              className="rounded-r-none"
            />
            <Button 
              type="submit" 
              size="md"
              disabled={isLoading}
              className="rounded-l-none border-l-0 px-3"
              aria-label="Buscar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </form>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rol
          </label>
          <select
            value={filters.role || 'all'}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Todos los roles</option>
            <option value="Entry">Entry</option>
            <option value="Flex">Flex</option>
            <option value="Support">Support</option>
          </select>
        </div>

        {/* Team Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Equipo
          </label>
          <select
            value={filters.teamId || 'all'}
            onChange={(e) => handleTeamChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Todos los equipos</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Región
          </label>
          <select
            value={filters.region || 'all'}
            onChange={(e) => handleRegionChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Todas las regiones</option>
            {availableRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ordenar por
          </label>
          <div className="flex">
            <select
              value={filters.sortBy || 'points'}
              onChange={(e) => handleSortChange(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="points">Puntos</option>
              <option value="name">Nombre</option>
              <option value="team">Equipo</option>
            </select>
            <button
              type="button"
              onClick={handleSortOrderChange}
              disabled={isLoading}
              className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label={`Ordenar ${filters.sortOrder === 'desc' ? 'ascendente' : 'descendente'}`}
            >
              {filters.sortOrder === 'desc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.role && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
              Rol: {filters.role}
              <button
                onClick={() => handleRoleChange('all')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-800"
                aria-label="Quitar filtro de rol"
              >
                ×
              </button>
            </span>
          )}
          {filters.teamId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
              Equipo: {teams.find(t => t.id === filters.teamId)?.name}
              <button
                onClick={() => handleTeamChange('all')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-800"
                aria-label="Quitar filtro de equipo"
              >
                ×
              </button>
            </span>
          )}
          {filters.region && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
              Región: {filters.region}
              <button
                onClick={() => handleRegionChange('all')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-800"
                aria-label="Quitar filtro de región"
              >
                ×
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
              Búsqueda: "{filters.search}"
              <button
                onClick={() => {
                  setLocalSearch('');
                  onFiltersChange({ ...filters, search: undefined, page: 1 });
                }}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-800"
                aria-label="Quitar filtro de búsqueda"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </Card>
  );
}