'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, Button, Card, LoadingSpinner } from '../../../../../shared/ui';
import { PlayerStats } from '../../../../../features/players/components/PlayerStats';
import { NextMatchCard } from '../../../../../features/players/components/NextMatchCard';
import { usePlayerDetails, usePlayerNextMatch } from '../../../../../features/players/hooks/usePlayers';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const playerId = parseInt(id, 10);

  // Data fetching
  const { 
    data: player, 
    isLoading: playerLoading, 
    error: playerError,
    refetch: refetchPlayer
  } = usePlayerDetails(playerId, !isNaN(playerId));

  const { 
    data: nextMatch, 
    isLoading: matchLoading 
  } = usePlayerNextMatch(playerId, !isNaN(playerId) && !!player);

  // Handle invalid ID
  if (isNaN(playerId)) {
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
              ID de jugador inválido
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              El ID proporcionado no es válido.
            </p>
            <Button onClick={() => router.push('/app/players')}>
              Volver a jugadores
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (playerLoading) {
    return (
      <div className="container-responsive py-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <Card padding="lg" className="animate-pulse">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
              </div>
            </div>
          </Card>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card padding="lg" className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div>
              <Card padding="lg" className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (playerError) {
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
              Error al cargar jugador
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No se pudo encontrar la información del jugador solicitado.
            </p>
            <div className="flex space-x-3 justify-center">
              <Button variant="outline" onClick={() => refetchPlayer()}>
                Intentar de nuevo
              </Button>
              <Button onClick={() => router.push('/app/players')}>
                Volver a jugadores
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!player) {
    return null;
  }

  const roleColors = {
    Entry: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    Flex: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Support: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  };

  return (
    <div className="container-responsive py-6 space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2 text-sm">
        <Link 
          href="/app/players" 
          className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400"
        >
          Jugadores
        </Link>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 dark:text-white font-medium">
          {player.nickname}
        </span>
      </div>

      {/* Player Header */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar
            src={player.imageUrl}
            alt={player.nickname}
            size="xl"
            fallback={player.nickname[0]?.toUpperCase()}
          />
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {player.nickname}
              </h1>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <span className={clsx(
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  roleColors[player.role]
                )}>
                  {player.role}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {player.region}
                </span>
                {player.isActive && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Activo
                  </span>
                )}
              </div>
            </div>

            {player.realName && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                {player.realName}
              </p>
            )}

            <div className="flex items-center space-x-6">
              {/* Team Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  {player.Team.logoUrl ? (
                    <img
                      src={player.Team.logoUrl}
                      alt={player.Team.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-500">
                      {player.Team.name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {player.Team.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {player.Team.region}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {player.socialLinks && (
                <div className="flex items-center space-x-3">
                  {player.socialLinks.twitter && (
                    <a
                      href={player.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      aria-label="Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {player.socialLinks.twitch && (
                    <a
                      href={player.socialLinks.twitch}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-500 transition-colors"
                      aria-label="Twitch"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                      </svg>
                    </a>
                  )}
                  {player.socialLinks.instagram && (
                    <a
                      href={player.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Miembro desde {new Date(player.joinedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long'
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Section */}
        <div className="lg:col-span-2">
          <PlayerStats player={player} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Match */}
          <NextMatchCard 
            match={nextMatch} 
            isLoading={matchLoading}
            playerTeamName={player.Team.name}
          />

          {/* Quick Actions */}
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acciones
            </h3>
            
            <div className="space-y-3">
              <Link href={`/app/players?teamId=${player.teamId}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ver compañeros de equipo
                </Button>
              </Link>

              <Link href={`/app/players?role=${player.role}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Otros jugadores {player.role}
                </Button>
              </Link>

              <Link href={`/app/players?region=${player.region}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Jugadores de {player.region}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Player Info */}
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">ID</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">#{player.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rol</span>
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                  roleColors[player.role]
                )}>
                  {player.role}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Región</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{player.region}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                <div className="flex items-center space-x-1">
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    player.isActive ? 'bg-green-500' : 'bg-red-500'
                  )}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {player.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Equipo desde</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(player.joinedAt).toLocaleDateString('es-ES', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}