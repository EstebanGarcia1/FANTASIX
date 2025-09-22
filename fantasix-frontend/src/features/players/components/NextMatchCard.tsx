'use client';

import Link from 'next/link';
import { Card } from '../../../shared/ui';
import type { NextMatch } from '../../../entities/players/types';
import { clsx } from 'clsx';

interface NextMatchCardProps {
  match: NextMatch | null;
  isLoading?: boolean;
  playerTeamName: string;
}

export function NextMatchCard({ match, isLoading, playerTeamName }: NextMatchCardProps) {
  if (isLoading) {
    return (
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Próximo Partido
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!match) {
    return (
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Próximo Partido
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No hay partidos programados
          </p>
        </div>
      </Card>
    );
  }

  const matchDate = new Date(match.date);
  const now = new Date();
  const timeUntilMatch = matchDate.getTime() - now.getTime();
  const daysUntilMatch = Math.ceil(timeUntilMatch / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchStatus = () => {
    if (timeUntilMatch < 0) {
      return { text: 'Partido finalizado', color: 'text-gray-500' };
    } else if (daysUntilMatch === 0) {
      return { text: '¡Hoy!', color: 'text-red-600 dark:text-red-400' };
    } else if (daysUntilMatch === 1) {
      return { text: 'Mañana', color: 'text-orange-600 dark:text-orange-400' };
    } else if (daysUntilMatch <= 7) {
      return { text: `En ${daysUntilMatch} días`, color: 'text-yellow-600 dark:text-yellow-400' };
    } else {
      return { text: `En ${daysUntilMatch} días`, color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const matchStatus = getMatchStatus();

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Próximo Partido
        </h3>
        <span className={clsx('text-sm font-medium', matchStatus.color)}>
          {matchStatus.text}
        </span>
      </div>

      <div className="space-y-4">
        {/* Match Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {match.rivalTeam.logoUrl ? (
                <img
                  src={match.rivalTeam.logoUrl}
                  alt={match.rivalTeam.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  {match.rivalTeam.name[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {match.isHome ? `${playerTeamName} vs ${match.rivalTeam.name}` : `${match.rivalTeam.name} vs ${playerTeamName}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {match.tournament.name}
              </p>
            </div>
          </div>
          
          {match.isHome && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Local
            </span>
          )}
        </div>

        {/* Match Details */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Fecha
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(matchDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Hora
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatTime(matchDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Ronda
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {match.round}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Formato
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {match.format}
            </p>
          </div>
        </div>

        {/* Countdown */}
        {timeUntilMatch > 0 && (
          <div className="text-center p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
            <p className="text-xs text-brand-600 dark:text-brand-400 mb-1">
              Tiempo restante
            </p>
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                {daysUntilMatch > 0 ? (
                  `${daysUntilMatch} día${daysUntilMatch > 1 ? 's' : ''}`
                ) : (
                  'Menos de 1 día'
                )}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Link 
            href={`/app/matches/${match.id}`}
            className="flex-1"
          >
            <button className="w-full px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 rounded-md transition-colors">
              Ver detalles del partido
            </button>
          </Link>
        </div>

        {/* Tournament Info */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Torneo: {match.tournament.name}</span>
            <span>ID: #{match.id}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}