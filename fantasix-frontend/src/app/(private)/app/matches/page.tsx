// src/app/(private)/app/matches/page.tsx

'use client';

import { useState } from 'react';
import { useConfig } from '../../../../shared/api/hooks';
import { Card, LoadingSpinner, EmptyState, Button } from '../../../../shared/ui';
import { MatchesTabs } from '../../../../features/matches/components/MatchesTabs';
import { MatchCard } from '../../../../features/matches/components/MatchCard';
import { MiniBracket } from '../../../../features/matches/components/MiniBracket';
import { useMatches, useLiveMatches } from '../../../../features/matches/hooks/useMatches';
import { useUserMatchesHighlight } from '../../../../features/matches/hooks/useUserHighlight';
import type { MatchTab } from '../../../../entities/matches/types';
import toast from 'react-hot-toast';

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<MatchTab>('upcoming');
  const [page, setPage] = useState(1);

  // Data fetching
  const { data: config } = useConfig();
  const { 
    data: matchesData, 
    isLoading, 
    error,
    isFetching,
    refetch
  } = useMatches(activeTab, { page, size: 20 });
  
  const { data: liveMatches } = useLiveMatches();
  
  // Get user highlights for current matches
  const currentPhase = config?.draftGruposOpen ? 'group' : 'playoffs';
  const highlights = useUserMatchesHighlight(
    matchesData?.matches || [], 
    currentPhase as 'group' | 'playoffs'
  );

  const handleTabChange = (tab: MatchTab) => {
    setActiveTab(tab);
    setPage(1); // Reset pagination when switching tabs
  };

  const handleLoadMore = () => {
    if (matchesData?.hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Partidos actualizados');
    } catch (error) {
      toast.error('Error al actualizar partidos');
    }
  };

  if (error) {
    return (
      <div className="container-responsive py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Partidos
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Calendario y resultados de los torneos
          </p>
        </div>

        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error al cargar partidos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No se pudieron obtener los datos de los partidos
            </p>
            <Button onClick={handleRefresh}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-responsive py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Partidos
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Calendario y resultados de los torneos
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Mini Bracket */}
      <MiniBracket />

      {/* Main Content */}
      <Card padding="none">
        {/* Tabs */}
        <div className="px-6 pt-6">
          <MatchesTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            upcomingCount={activeTab === 'upcoming' ? matchesData?.matches.length : undefined}
            liveCount={liveMatches?.matches.length}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && page === 1 ? (
            // Initial loading
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card padding="md">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : matchesData?.matches.length === 0 ? (
            // Empty state
            <EmptyState
              title={
                activeTab === 'upcoming' 
                  ? "No hay partidos programados"
                  : "No hay resultados recientes"
              }
              description={
                activeTab === 'upcoming'
                  ? "Los próximos partidos aparecerán aquí cuando sean programados"
                  : "Los resultados de partidos finalizados aparecerán aquí"
              }
              action={
                <Button variant="outline" onClick={handleRefresh}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar
                </Button>
              }
            />
          ) : (
            // Matches list
            <div className="space-y-4">
              {/* Live matches banner for upcoming tab */}
              {activeTab === 'upcoming' && liveMatches?.matches && liveMatches.matches.length > 0 && (
                <Card padding="sm" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {liveMatches.matches.length} partido{liveMatches.matches.length !== 1 ? 's' : ''} en vivo
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Matches grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {matchesData?.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    highlight={highlights.get(match.id)}
                    showCountdown={activeTab === 'upcoming'}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {matchesData?.hasMore && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    loading={isFetching}
                  >
                    {isFetching ? 'Cargando...' : 'Ver más partidos'}
                  </Button>
                </div>
              )}

              {/* Pagination info */}
              {matchesData && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
                  Mostrando {matchesData.matches.length} de {matchesData.total} partidos
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}