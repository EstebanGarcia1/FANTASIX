// src/features/matches/components/MatchesTabs.tsx

'use client';

import { clsx } from 'clsx';
import type { MatchTab } from '../../../entities/matches/types';

interface MatchesTabsProps {
  activeTab: MatchTab;
  onTabChange: (tab: MatchTab) => void;
  upcomingCount?: number;
  liveCount?: number;
}

const TABS = [
  {
    id: 'upcoming' as const,
    name: 'Agenda',
    icon: '📅',
    description: 'Próximos partidos',
  },
  {
    id: 'recent' as const,
    name: 'Resultados',
    icon: '🏆',
    description: 'Partidos finalizados',
  },
];

export function MatchesTabs({ 
  activeTab, 
  onTabChange, 
  upcomingCount,
  liveCount 
}: MatchesTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'upcoming' ? upcomingCount : undefined;
          const showLiveBadge = tab.id === 'upcoming' && liveCount && liveCount > 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors relative',
                isActive && [
                  'border-brand-500 text-brand-600 dark:text-brand-400',
                ],
                !isActive && [
                  'border-transparent text-gray-500 dark:text-gray-400',
                  'hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                ],
              )}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.name}</span>
              
              {/* Count badge */}
              {count !== undefined && count > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-brand-100 bg-brand-600 rounded-full">
                  {count}
                </span>
              )}

              {/* Live indicator */}
              {showLiveBadge && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}