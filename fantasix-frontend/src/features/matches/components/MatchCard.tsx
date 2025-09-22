// src/features/matches/components/MatchCard.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Avatar } from '../../../shared/ui';
import { formatMatchTime, getMatchStatusColor, getMatchStatusText, shouldShowCountdown } from '../utils/matchTime';
import type { Match, UserTeamHighlight } from '../../../entities/matches/types';
import { clsx } from 'clsx';

interface MatchCardProps {
  match: Match;
  highlight?: UserTeamHighlight;
  showCountdown?: boolean;
}

function TeamDisplay({ team, score, isWinner }: { 
  team: Match['teamA']; 
  score?: number; 
  isWinner?: boolean;
}) {
  return (
    <div className={clsx(
      'flex items-center space-x-3 flex-1',
      isWinner && 'font-medium text-green-600 dark:text-green-400'
    )}>
      <Avatar
        src={team.logoUrl}
        alt={team.name}
        size="sm"
        fallback={team.name[0]?.toUpperCase()}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {team.name}
        </p>
        {team.region && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {team.region}
          </p>
        )}
      </div>
      {typeof score === 'number' && (
        <div className={clsx(
          'text-lg font-bold',
          isWinner 
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-600 dark:text-gray-400'
        )}>
          {score}
        </div>
      )}
    </div>
  );
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState(formatMatchTime(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatMatchTime(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!time.countdown || time.countdown.isLive) {
    return (
      <div className="text-xs text-red-600 dark:text-red-400 font-medium">
        ¡EN VIVO!
      </div>
    );
  }

  const { days, hours, minutes, seconds } = time.countdown;

  return (
    <div className="text-xs text-gray-600 dark:text-gray-400">
      {days > 0 && `${days}d `}
      {(days > 0 || hours > 0) && `${hours}h `}
      {(days === 0 && hours < 24) && `${minutes}m `}
      {(days === 0 && hours === 0 && minutes < 60) && `${seconds}s`}
    </div>
  );
}

export function MatchCard({ match, highlight, showCountdown = true }: MatchCardProps) {
  const time = formatMatchTime(match.date);
  const statusColor = getMatchStatusColor(match.status);
  const statusText = getMatchStatusText(match.status);
  
  const isFinished = match.status === 'finished';
  const winnerA = isFinished && match.scoreA > match.scoreB;
  const winnerB = isFinished && match.scoreB > match.scoreA;
  
  const shouldShowTimer = showCountdown && shouldShowCountdown(match.date) && match.status === 'scheduled';

  return (
    <Card 
      padding="md" 
      className={clsx(
        'transition-all duration-200',
        highlight?.hasPlayers && 'ring-2 ring-brand-300 border-brand-300 bg-brand-50/50 dark:bg-brand-900/10'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            statusColor
          )}>
            {statusText}
          </span>
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {match.format}
          </span>
          
          {match.round && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              • {match.round}
            </span>
          )}
        </div>

        {highlight?.hasPlayers && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
            👥 Tengo jugadores
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-3">
        <TeamDisplay 
          team={match.teamA} 
          score={isFinished ? match.scoreA : undefined}
          isWinner={winnerA}
        />
        
        <div className="flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500 font-medium">
            VS
          </div>
        </div>
        
        <TeamDisplay 
          team={match.teamB} 
          score={isFinished ? match.scoreB : undefined}
          isWinner={winnerB}
        />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {time.formatted}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {time.relative}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {shouldShowTimer && (
              <Countdown targetDate={match.date} />
            )}
            
            {match.externalUrl && (
              <Link 
                href={match.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
              >
                Ver detalles ↗
              </Link>
            )}
          </div>
        </div>

        {/* Map scores for finished matches */}
        {isFinished && match.mapScores.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Mapas:
            </p>
            <div className="flex flex-wrap gap-1">
              {match.mapScores.map((score, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {score}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tournament info */}
        {match.tournament && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {match.tournament.name}
              {match.phase && ` • ${match.phase}`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}