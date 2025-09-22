// src/features/matches/utils/matchTime.ts

import type { MatchTime, MatchCountdown } from '../../../entities/matches/types';

// Madrid timezone
const TIMEZONE = 'Europe/Madrid';

export function formatMatchTime(dateString: string): MatchTime {
  const date = new Date(dateString);
  const now = new Date();
  
  // Format for display
  const formatted = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  // Relative time
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);
  
  let relative: string;
  if (diffMs > 0) {
    // Future
    if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      relative = `En ${minutes} min`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      relative = `En ${hours}h`;
    } else {
      const days = Math.floor(diffHours / 24);
      relative = `En ${days}d`;
    }
  } else {
    // Past
    if (diffHours < 1) {
      relative = 'Hace poco';
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      relative = `Hace ${hours}h`;
    } else {
      const days = Math.floor(diffHours / 24);
      relative = `Hace ${days}d`;
    }
  }

  // Countdown for upcoming matches
  let countdown: MatchCountdown | undefined;
  if (diffMs > 0 && diffHours < 72) { // Only for next 3 days
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    countdown = {
      days,
      hours,
      minutes,
      seconds,
      isLive: diffMs <= 0 && diffMs > -(30 * 60 * 1000), // Live window: 30 minutes
    };
  }

  return {
    formatted,
    relative,
    countdown,
  };
}

export function getMatchStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    case 'in_progress':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    case 'finished':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    case 'cancelled':
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
  }
}

export function getMatchStatusText(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Programado';
    case 'in_progress':
      return 'En vivo';
    case 'finished':
      return 'Finalizado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
}

export function shouldShowCountdown(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Show countdown for matches in the next 48 hours
  return diffMs > 0 && diffHours <= 48;
}