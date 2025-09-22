'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card, LoadingSpinner } from '../../../../shared/ui';
import { LeaderboardTabs } from '../../../../features/leaderboard/components/LeaderboardTabs';
import { LeaderboardTable } from '../../../../features/leaderboard/components/LeaderboardTable';
import { JumpToMeBar } from '../../../../features/leaderboard/components/JumpToMeBar';
import { useLeaderboardWithPosition } from '../../../../features/leaderboard/hooks/useLeaderboard';
import { useConfig } from '../../../../shared/api/hooks';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import type { LeaderboardType, LeaderboardFilters } from '../../../../entities/leaderboard/types';
import type { FantasyPhase } from '../../../../entities/types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const PAGE_SIZE = 50;

export default function LeaderboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial values from URL
  const phaseFromUrl = searchParams.get('phase') as FantasyPhase | null;
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const searchFromUrl = searchParams.get('q') || '';

  // Config for default phase and draft status
  const { data: config, isLoading: configLoading } = useConfig();
  
  // State management
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global');
  const [activePhase, setActivePhase] = useState<FantasyPhase>(
    phaseFromUrl || config?.activePhase || 'group'
  );
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [highlightPosition, setHighlightPosition] = useState<number | undefined>();

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Update URL when filters change
  const updateURL = useCallback((updates: Partial<{ phase: FantasyPhase; page: number; q: string }>) => {
    const params = new URLSearchParams(searchParams);
    
    if (updates.phase !== undefined) {
      if (updates.phase !== config?.activePhase) {
        params.set('phase', updates.phase);
      } else {
        params.delete('phase');
      }
    }
    
    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set('page', updates.page.toString());
      } else {
        params.delete('page');
      }
    }
    
    if (updates.q !== undefined) {
      if (updates.q.trim()) {
        params.set('q', updates.q.trim());
      } else {
        params.delete('q');
      }
    }

    const newURL = params.toString() ? `/app/leaderboard?${params.toString()}` : '/app/leaderboard';
    router.replace(newURL, { scroll: false });
  }, [searchParams, router, config?.activePhase]);

  // Update phase from config when available
  useEffect(() => {
    if (config?.activePhase && !phaseFromUrl) {
      setActivePhase(config.activePhase);
    }
  }, [config?.activePhase, phaseFromUrl]);

  // Prepare filters for the query
  const filters: LeaderboardFilters = useMemo(() => ({
    phase: activePhase,
    page: currentPage,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
  }), [activePhase, currentPage, debouncedSearch]);

  // Data fetching
  const {
    data: leaderboardData,
    isLoading,
    error,
    refetch,
    myPosition,
    isLoadingPosition
  } = useLeaderboardWithPosition(filters);

  // Draft status
  const isDraftClosed = useMemo(() => {
    if (!config) return false;
    return activePhase === 'group' ? !config.draftGruposOpen : !config.draftPlayoffsOpen;
  }, [config, activePhase]);

  // Event handlers
  const handlePhaseChange = (phase: FantasyPhase) => {
    setActivePhase(phase);
    setCurrentPage(1);
    setHighlightPosition(undefined);
    updateURL({ phase, page: 1, q: debouncedSearch });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setHighlightPosition(undefined);
    updateURL({ page, phase: activePhase, q: debouncedSearch });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    setHighlightPosition(undefined);
    // URL will be updated when debounced search triggers
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ q: searchQuery, page: 1, phase: activePhase });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setHighlightPosition(undefined);
    updateURL({ q: '', page: 1, phase: activePhase });
  };

  const handleJumpToPosition = (targetPage: number) => {
    setCurrentPage(targetPage);
    if (myPosition) {
      setHighlightPosition(myPosition.position);
    }
    updateURL({ page: targetPage, phase: activePhase, q: debouncedSearch });
  };

  const handleScrollToPosition = (position: number) => {
    setHighlightPosition(position);
  };

  const handleRetry = () => {
    refetch();
    toast.success('Recargando ranking...');
  };

  // Update URL when debounced search changes
  useEffect(() => {
    if (searchQuery !== searchFromUrl) {
      updateURL({ q: debouncedSearch, page: 1, phase: activePhase });
    }
  }, [debouncedSearch, searchQuery, searchFromUrl, activePhase, updateURL]);

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
              Error al cargar el ranking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ha ocurrido un error al obtener los datos del leaderboard.
            </p>
            <Button onClick={handleRetry}>
              Intentar de nuevo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalPages = leaderboardData?.totalPages || 0;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return (
    <div className="container-responsive py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ranking Fantasy
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Clasificación global de todos los usuarios
          </p>
        </div>

        {/* Phase Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mt-4 sm:mt-0">
          <button
            onClick={() => handlePhaseChange('group')}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
              activePhase === 'group'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            )}
            aria-pressed={activePhase === 'group'}
          >
            Grupos
          </button>
          <button
            onClick={() => handlePhaseChange('playoffs')}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
              activePhase === 'playoffs'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            )}
            aria-pressed={activePhase === 'playoffs'}
          >
            Playoffs
          </button>
        </div>
      </div>

      {/* Draft Status */}
      <div className="flex items-center space-x-2">
        <div
          className={clsx(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            isDraftClosed
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          )}
        >
          <div
            className={clsx(
              'w-2 h-2 rounded-full mr-2',
              isDraftClosed ? 'bg-red-500' : 'bg-green-500'
            )}
          />
          {isDraftClosed ? 'Draft cerrado' : 'Draft abierto'}
        </div>
        {!isDraftClosed && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            • Los equipos se mostrarán cuando cierre el draft
          </span>
        )}
      </div>

      {/* Tabs */}
      <Card padding="none">
        <div className="px-6 pt-6">
          <LeaderboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="p-6 space-y-6" role="tabpanel" id={`${activeTab}-panel`}>
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar usuario por nombre..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full"
                aria-label="Buscar usuario"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </Button>
            {debouncedSearch && (
              <Button variant="outline" onClick={clearSearch}>
                Limpiar
              </Button>
            )}
          </form>

          {/* Jump to Me Bar */}
          {myPosition && (
            <JumpToMeBar
              phase={activePhase}
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              onPageChange={handleJumpToPosition}
              onScrollToPosition={handleScrollToPosition}
              myPosition={myPosition.position}
            />
          )}

          {/* Results Info */}
          {leaderboardData && !isLoading && (
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div>
                Mostrando {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, leaderboardData.total)} de {leaderboardData.total.toLocaleString()} usuarios
                {debouncedSearch && (
                  <span className="ml-2">
                    • Filtrado por: "{debouncedSearch}"
                  </span>
                )}
              </div>
              <div>
                Página {currentPage} de {totalPages}
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <LeaderboardTable
            data={leaderboardData?.rows || []}
            isLoading={isLoading}
            phase={activePhase}
            isDraftClosed={isDraftClosed}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            highlightPosition={highlightPosition}
          />

          {/* Pagination */}
          {leaderboardData && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
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
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}