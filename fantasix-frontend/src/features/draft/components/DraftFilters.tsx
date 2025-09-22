'use client';

import { useState } from 'react';
import { Input, Button, Card } from '../../../shared/ui';
import { useTeams } from '../../../shared/api/hooks';
import type { PlayerFilters } from '../../../entities/types';

interface DraftFiltersProps {
  filters: PlayerFilters;
  onFiltersChange: (filters: PlayerFilters) => void;
  isLoading?: boolean;
}

export function DraftFilters({ filters, onFiltersChange, isLoading }: DraftFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const { data: teams = [] } = useTeams();

  const handleRoleChange = (role: string) => {
    onFiltersChange({
      ...filters,
      role: role === 'all' ? undefined : role as 'Entry' | 'Flex' | 'Support',
    });
  };

  const handleTeamChange = (teamId: string) => {
    onFiltersChange({
      ...filters,
      teamId: teamId === 'all' ? undefined : parseInt(teamId),
    });
  };

  const handleRegionChange = (region: string) => {
    onFiltersChange({
      ...filters,
      region: region === 'all' ? undefined : region,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      search: localSearch.trim() || undefined,
    });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({});
  };

  const hasActiveFilters = filters.role || filters.teamId || filters.region || filters.search;

  return (
    <Card padding="md" className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filtros de Jugadores
        </h2>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            disabled={isLoading}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rol Filter */}
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
            <option value="EU">Europa</option>
            <option value="NA">Norteamérica</option>
            <option value="LATAM">Latinoamérica</option>
            <option value="APAC">Asia-Pacífico</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar
          </label>
          <form onSubmit={handleSearchSubmit} className="flex">
            <Input
              type="text"
              placeholder="Nombre del jugador..."
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
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </form>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.role && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
              Rol: {filters.role}
            </span>
          )}
          {filters.teamId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
              Equipo: {teams.find(t => t.id === filters.teamId)?.name}
            </span>
          )}
          {filters.region && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
              Región: {filters.region}
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
              Búsqueda: "{filters.search}"
            </span>
          )}
        </div>
      )}
    </Card>
  );
}