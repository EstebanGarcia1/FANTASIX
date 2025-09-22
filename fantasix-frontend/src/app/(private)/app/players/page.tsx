'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, LoadingSpinner, Card, EmptyState } from '../../../../shared/ui';
import { PlayerFilters } from '../../../../features/players/components/PlayerFilters';
import { PlayerCard } from '../../../../features/players/components/PlayerCard';
import { usePlayers } from '../../../../features/players/hooks/usePlayers';
import { useConfig } from '../../../../shared/api/hooks';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import type { PlayerFilters as PlayerFiltersType, PlayerViewMode, PlayerDraftAction } from '../../../../entities/players/types';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

export default function PlayersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial state from URL
  const roleFromUrl = searchParams.get('role') as 'Entry' | 'Flex' | 'Support' | null;
  const teamIdFromUrl = searchParams.get('teamId');
  const regionFromUrl = searchParams.get('region');
  const searchFromUrl = searchParams.get('q') || '';
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const viewModeFromUrl = searchParams.get('view') as PlayerViewMode || 'grid';
  const sortByFromUrl = searchParams.get('sortBy') as 'points' | 'name' | 'team' || 'points';
  const sortOrderFromUrl = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

  // Config for draft status
  const { data: config, isLoading: configLoading } = useConfig();

  // State management
  const [viewMode, setViewMode] = useState<PlayerViewMode>(viewModeFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Prepare filters
  const filters: PlayerFiltersType = useMemo(() => ({
    role: roleFromUrl || undefined,
    teamId: teamIdFromUrl ? parseInt(teamIdFromUrl) : undefined,
    region: regionFromUrl || undefined,
    search: debouncedSearch || undefined,
    page: pageFromUrl,
    limit: PAGE_SIZE,
    sortBy: sortByFromUrl,
    sortOrder: sortOrderFromUrl,
  }), [roleFromUrl, teamIdFromUrl, regionFromUrl, debouncedSearch, pageFromUrl, sortByFromUrl, sortOrderFromUrl]);

  // Data fetching
  const { 
    data: playersData, 
    isLoading, 
    error, 
    refetch,
    teams,
    regions 
  } = usePlayers(filters);

  // Draft status
  const isDraftOpen = useMemo(() => {
    if (!config) return false;
    // Check if any phase is open (could be expanded to check specific phase)
    return config.draftGruposOpen || config.draftPlayoffsOpen;
  }, [config]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: Partial<PlayerFiltersType>, newViewMode?: PlayerViewMode) => {
    const params = new URLSearchParams();
    
    if (newFilters.role) params.set('role', newFilters.role);
    if (newFilters.teamId) params.set('teamId', newFilters.teamId.toString());
    if (newFilters.region) params.set('region', newFilters.region);
    if (newFilters.search?.trim()) params.set('q', newFilters.search.trim());
    if ((newFilters.page || 1) > 1) params.set('page', (newFilters.page || 1).toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'points') params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder && newFilters.sortOrder !== 'desc') params.set('sortOrder', newFilters.sortOrder);
    if ((newViewMode || viewMode) !== 'grid') params.set('view', newViewMode || viewMode);

    const newURL = params.toString() ? `/app/players?${params.toString()}` : '/app/players';
    router.replace(newURL, { scroll: false });
  }, [router, viewMode]);

  // Event handlers
  const handleFiltersChange = (newFilters: PlayerFiltersType) => {
    updateURL(newFilters);
  };

  const handleViewModeChange = (newViewMode: PlayerViewMode) => {
    setViewMode(newViewMode);
    updateURL(filters, newViewMode);
  };

  const handlePageChange = (page: number) => {
    updateURL({ ...filters, page });
  };

  const handleDraftAction = (action: PlayerDraftAction) => {
    if (!isDraftOpen) {
      toast.error('El draft está cerrado');
      return;
    }

    // Update local selection state
    const newSelected = new Set(selectedPlayers);
    if (action.action === 'add') {
      newSelected.add(action.playerId);
      toast.success(`${action.player.nickname} añadido al draft`);
    } else {
      newSelected.delete(action.playerId);
      toast.success(`${action.player.nickname} removido del draft`);
    }
    setSelectedPlayers(newSelected);

    // TODO: Integrate with draft context/state management
    // This would typically call the draft hook to update the actual draft state
  };

  const handleRetry = () => {
    refetch();
    toast.success('Recargando jugadores...');
  };

  // Loading state
  if (configLoading) {
    return (
      <div className="container-responsive py-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-responsive py-8">
        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error al cargar jugadores
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ha ocurrido un error al obtener los datos de los jugadores.
            </p>
            <Button onClick={handleRetry}>
              Intentar de nuevo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalPages = playersData?.totalPages || 0;
  const hasNextPage = (filters.page || 1) < totalPages;
  const hasPreviousPage = (filters.page || 1) > 1;

  return (
    <div className="container-responsive py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Jugadores
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Catálogo completo de jugadores profesionales
          </p>
        </div>

        {/* Draft Status */}
        {config && (
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isDraftOpen
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isDraftOpen ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isDraftOpen ? 'Draft abierto' : 'Draft cerrado'}
            </div>
            {selectedPlayers.size > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPlayers.size} seleccionado{selectedPlayers.size > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <PlayerFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        availableRegions={regions}
        isLoading={isLoading}
        totalResults={playersData?.total || 0}
      />

      {/* Players List */}
      {isLoading ? (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <Card key={i} padding="md" className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array(10).fill(0).map((_, i) => (
                <Card key={i} padding="md" className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/6"></div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : playersData?.players.length === 0 ? (
        <EmptyState
          title="No se encontraron jugadores"
          description="Intenta ajustar los filtros para encontrar jugadores"
        />
      ) : (
        <>
          {/* Results */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Mostrando {((filters.page || 1) - 1) * PAGE_SIZE + 1} - {Math.min((filters.page || 1) * PAGE_SIZE, playersData?.total || 0)} de {(playersData?.total || 0).toLocaleString()} jugadores
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {playersData?.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  viewMode={viewMode}
                  isDraftOpen={isDraftOpen}
                  isSelected={selectedPlayers.has(player.id)}
                  canSelect={true} // TODO: Add validation logic from draft
                  onDraftAction={handleDraftAction}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {playersData?.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  viewMode={viewMode}
                  isDraftOpen={isDraftOpen}
                  isSelected={selectedPlayers.has(player.id)}
                  canSelect={true} // TODO: Add validation logic from draft
                  onDraftAction={handleDraftAction}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={!hasPreviousPage || isLoading}
                  aria-label="Página anterior"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={!hasNextPage || isLoading}
                  aria-label="Página siguiente"
                >
                  Siguiente
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  const currentPage = filters.page || 1;
                  
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={isLoading}
                      aria-label={`Ir a la página ${pageNumber}`}
                      aria-current={pageNumber === currentPage ? 'page' : undefined}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Página {filters.page || 1} de {totalPages}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}