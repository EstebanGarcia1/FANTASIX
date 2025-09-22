'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useConfig, useMyFantasyTeam, useRewardsStatus } from '../../shared/api/hooks';
import { Button, Card, LoadingSpinner, EmptyState } from '../../shared/ui';
import { DailyRewardCard } from '../../features/rewards/DailyRewardCard';

export default function DashboardPage() {
  const [selectedPhase, setSelectedPhase] = useState<'group' | 'playoffs'>('group');
  
  // Data fetching
  const { data: config, isLoading: configLoading } = useConfig();
  const { data: myTeam, isLoading: teamLoading } = useMyFantasyTeam(selectedPhase);
  const { data: rewardsStatus } = useRewardsStatus();

  if (configLoading) {
    return (
      <div className="container-responsive py-8">
        <LoadingSpinner className="mx-auto" />
      </div>
    );
  }

  const isDraftOpen = selectedPhase === 'group' 
    ? config?.draftGruposOpen 
    : config?.draftPlayoffsOpen;

  return (
    <div className="container-responsive py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gestiona tu equipo fantasy y sigue tu progreso
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Reward */}
        <DailyRewardCard />

        {/* Draft Status */}
        <Card padding="md" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-500/10 to-brand-600/5 rounded-full -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Estado del Draft
              </h3>
              <div className={`w-3 h-3 rounded-full ${isDraftOpen ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isDraftOpen ? 'Draft abierto' : 'Draft cerrado'}
            </p>
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                Grupos: {config?.draftGruposOpen ? '🟢 Abierto' : '🔴 Cerrado'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Playoffs: {config?.draftPlayoffsOpen ? '🟢 Abierto' : '🔴 Cerrado'}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Action */}
        <Card padding="md" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-siege-orange/10 to-siege-gold/5 rounded-full -mr-12 -mt-12" />
          <div className="relative">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Acción Rápida
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isDraftOpen ? 'Optimiza tu equipo' : 'Revisa el ranking'}
            </p>
            <Link href={isDraftOpen ? '/app/draft' : '/app/leaderboard'}>
              <Button size="sm" className="w-full">
                {isDraftOpen ? 'Ir al Draft' : 'Ver Ranking'}
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* My Fantasy Team */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mi Equipo Fantasy
          </h2>
          
          {/* Phase Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mt-4 sm:mt-0">
            <button
              onClick={() => setSelectedPhase('group')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPhase === 'group'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Grupos
            </button>
            <button
              onClick={() => setSelectedPhase('playoffs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPhase === 'playoffs'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Playoffs
            </button>
          </div>
        </div>

        {teamLoading ? (
          <Card padding="lg">
            <LoadingSpinner />
          </Card>
        ) : myTeam ? (
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Equipo de {selectedPhase === 'group' ? 'Grupos' : 'Playoffs'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {myTeam.totalPoints} puntos totales
                </p>
              </div>
              {isDraftOpen && (
                <Link href={`/app/draft?phase=${selectedPhase}`}>
                  <Button size="sm" variant="outline">
                    Editar equipo
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {myTeam.picks.map((pick) => (
                <div
                  key={pick.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                >
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    {pick.player.imageUrl ? (
                      <img
                        src={pick.player.imageUrl}
                        alt={pick.player.nickname}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {pick.player.nickname[0]}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {pick.player.nickname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {pick.player.role} • {pick.player.totalPoints} pts
                  </p>
                  {pick.player.Team && (
                    <p className="text-xs text-gray-400 mt-1">
                      {pick.player.Team.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <EmptyState
            title={`No tienes equipo de ${selectedPhase}`}
            description={
              isDraftOpen 
                ? "¡Es hora de crear tu equipo fantasy!"
                : "El draft está cerrado actualmente"
            }
            action={
              isDraftOpen ? (
                <Link href={`/app/draft?phase=${selectedPhase}`}>
                  <Button>
                    Crear mi equipo
                  </Button>
                </Link>
              ) : undefined
            }
          />
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/app/leaderboard" className="block">
          <Card padding="md" className="card-hover text-center">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-medium text-gray-900 dark:text-white">Ranking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ver clasificación</p>
          </Card>
        </Link>

        <Link href="/app/players" className="block">
          <Card padding="md" className="card-hover text-center">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-medium text-gray-900 dark:text-white">Jugadores</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Estadísticas</p>
          </Card>
        </Link>

        <Link href="/app/matches" className="block">
          <Card padding="md" className="card-hover text-center">
            <div className="text-2xl mb-2">⚔️</div>
            <h3 className="font-medium text-gray-900 dark:text-white">Partidos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Resultados</p>
          </Card>
        </Link>

        <Link href="/app/profile" className="block">
          <Card padding="md" className="card-hover text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-medium text-gray-900 dark:text-white">Perfil</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configuración</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}