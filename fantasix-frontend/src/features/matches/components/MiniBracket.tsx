// src/features/matches/components/MiniBracket.tsx

'use client';

import { useState } from 'react';
import { Card, Avatar, Skeleton } from '../../../shared/ui';
import { useMiniBracket } from '../hooks/useMiniBracket';
import { formatMatchTime, getMatchStatusColor, getMatchStatusText } from '../utils/matchTime';
import type { BracketMatch } from '../../../entities/matches/types';
import { clsx } from 'clsx';

interface BracketMatchCardProps {
  match: BracketMatch;
  isCompact?: boolean;
}

function BracketMatchCard({ match, isCompact = false }: BracketMatchCardProps) {
  const statusColor = getMatchStatusColor(match.status);
  const statusText = getMatchStatusText(match.status);
  const isFinished = match.status === 'finished';
  
  const time = match.scheduledTime ? formatMatchTime(match.scheduledTime) : null;
  
  return (
    <div className={clsx(
      'border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800',
      isCompact ? 'min-w-[200px]' : 'min-w-[240px]'
    )}>
      {/* Status and time */}
      <div className="flex items-center justify-between mb-2">
        <span className={clsx(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
          statusColor
        )}>
          {statusText}
        </span>
        {time && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {time.relative}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {/* Team A */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {match.teamA ? (
              <>
                <Avatar
                  src={match.teamA.logoUrl}
                  alt={match.teamA.name}
                  size="sm"
                  fallback={match.teamA.name[0]?.toUpperCase()}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {match.teamA.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                TBD
              </span>
            )}
          </div>
          {isFinished && typeof match.scoreA === 'number' && (
            <span className={clsx(
              'text-sm font-bold',
              match.scoreA > (match.scoreB || 0)
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            )}>
              {match.scoreA}
            </span>
          )}
        </div>

        {/* VS Divider */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          VS
        </div>

        {/* Team B */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {match.teamB ? (
              <>
                <Avatar
                  src={match.teamB.logoUrl}
                  alt={match.teamB.name}
                  size="sm"
                  fallback={match.teamB.name[0]?.toUpperCase()}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {match.teamB.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                TBD
              </span>
            )}
          </div>
          {isFinished && typeof match.scoreB === 'number' && (
            <span className={clsx(
              'text-sm font-bold',
              match.scoreB > (match.scoreA || 0)
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            )}>
              {match.scoreB}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MiniBracket() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: bracket, isLoading, error } = useMiniBracket();

  if (isLoading) {
    return (
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-24 h-5" />
          </div>
          <Skeleton className="w-20 h-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </Card>
    );
  }

  if (error || !bracket) {
    return (
      <Card padding="md" className="border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-xl">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bracket del Torneo
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {isExpanded ? 'Contraer' : 'Expandir'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-600 dark:text-gray-400">
              El bracket se publicará próximamente
            </p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-xl">🏆</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bracket del Torneo
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({bracket.rounds.reduce((acc, round) => acc + round.matches.length, 0)} partidos)
          </span>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {isExpanded ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
              Contraer
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              Expandir
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {bracket.rounds.map((round, roundIndex) => (
            <div key={roundIndex}>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                {round.name}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {round.matches.map((match) => (
                  <BracketMatchCard 
                    key={match.id} 
                    match={match}
                    isCompact={round.matches.length > 6}
                  />
                ))}
              </div>
            </div>
          ))}
          
          {/* Last updated */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            Última actualización: {new Date(bracket.lastUpdated).toLocaleString('es-ES', {
              timeZone: 'Europe/Madrid',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      )}
    </Card>
  );
}