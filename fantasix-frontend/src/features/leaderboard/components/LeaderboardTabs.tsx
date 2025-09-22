'use client';

import { clsx } from 'clsx';
import type { LeaderboardType, LeaderboardTab } from '../../../entities/leaderboard/types';

interface LeaderboardTabsProps {
  activeTab: LeaderboardType;
  onTabChange: (tab: LeaderboardType) => void;
}

const TABS: LeaderboardTab[] = [
  {
    id: 'global',
    name: 'Global',
    enabled: true,
  },
  {
    id: 'my-league',
    name: 'Mi Liga',
    enabled: false,
    badge: 'Próximamente',
  },
];

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = !tab.enabled;
          
          return (
            <button
              key={tab.id}
              onClick={() => tab.enabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={clsx(
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                isActive && !isDisabled && [
                  'border-brand-500 text-brand-600 dark:text-brand-400',
                ],
                !isActive && !isDisabled && [
                  'border-transparent text-gray-500 dark:text-gray-400',
                  'hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                ],
                isDisabled && [
                  'border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed',
                ],
              )}
            >
              <span>{tab.name}</span>
              {tab.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}