// src/features/profile/components/StreakIndicator.tsx

'use client';

import { clsx } from 'clsx';
import type { StreakTier } from '../../../entities/profile/types';

interface StreakIndicatorProps {
  dailyStreak: number;
  className?: string;
}

// Streak tiers with rewards and visual indicators
const STREAK_TIERS: StreakTier[] = [
  { days: 1, name: 'Principiante', emoji: '🌟', color: 'text-yellow-500', reward: 50 },
  { days: 3, name: 'Consistente', emoji: '🔥', color: 'text-orange-500', reward: 75 },
  { days: 7, name: 'Semanal', emoji: '💪', color: 'text-red-500', reward: 100 },
  { days: 14, name: 'Dedicado', emoji: '🚀', color: 'text-purple-500', reward: 150 },
  { days: 30, name: 'Legendario', emoji: '👑', color: 'text-gold-500', reward: 200 },
  { days: 100, name: 'Mítico', emoji: '🏆', color: 'text-gradient', reward: 500 },
];

function getCurrentTier(streak: number): StreakTier {
  // Find the highest tier that the streak qualifies for
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_TIERS[i].days) {
      return STREAK_TIERS[i];
    }
  }
  
  // Default to first tier
  return STREAK_TIERS[0];
}

function getNextTier(streak: number): StreakTier | null {
  // Find the next tier to achieve
  for (const tier of STREAK_TIERS) {
    if (streak < tier.days) {
      return tier;
    }
  }
  
  // Already at max tier
  return null;
}

function getProgressToNextTier(streak: number): { current: number; target: number; percentage: number } {
  const nextTier = getNextTier(streak);
  
  if (!nextTier) {
    // At max tier
    return { current: streak, target: streak, percentage: 100 };
  }
  
  // Find the previous tier (or 0 if none)
  let previousTierDays = 0;
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_TIERS[i].days) {
      previousTierDays = STREAK_TIERS[i].days;
      break;
    }
  }
  
  const current = streak - previousTierDays;
  const target = nextTier.days - previousTierDays;
  const percentage = Math.min((current / target) * 100, 100);
  
  return { current, target, percentage };
}

export function StreakIndicator({ dailyStreak, className }: StreakIndicatorProps) {
  const currentTier = getCurrentTier(dailyStreak);
  const nextTier = getNextTier(dailyStreak);
  const progress = getProgressToNextTier(dailyStreak);

  if (dailyStreak === 0) {
    return (
      <div className={clsx('text-center py-4', className)}>
        <div className="text-4xl mb-2">😴</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¡Comienza tu racha reclamando tu primera recompensa!
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Current Streak Display */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-4xl">{currentTier.emoji}</span>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dailyStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              días seguidos
            </div>
          </div>
        </div>
        
        <div className={clsx('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', {
          'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200': currentTier.color.includes('yellow'),
          'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200': currentTier.color.includes('orange'),
          'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200': currentTier.color.includes('red'),
          'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200': currentTier.color.includes('purple'),
          'bg-gradient-to-r from-yellow-400 to-orange-500 text-white': currentTier.color.includes('gradient'),
        })}>
          {currentTier.name}
        </div>
      </div>

      {/* Progress to Next Tier */}
      {nextTier && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Progreso a {nextTier.name}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {dailyStreak}/{nextTier.days}
            </span>
          </div>
          
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
              <div
                style={{ width: `${progress.percentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {nextTier.days - dailyStreak} días restantes
            </span>
            <span className="flex items-center space-x-1">
              <span>{nextTier.emoji}</span>
              <span>+{nextTier.reward} SP</span>
            </span>
          </div>
        </div>
      )}

      {/* Milestone Achievements */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logros desbloqueados:
        </p>
        <div className="flex flex-wrap gap-1">
          {STREAK_TIERS.filter(tier => dailyStreak >= tier.days).map((tier) => (
            <span
              key={tier.days}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>{tier.emoji}</span>
              <span>{tier.days}d</span>
            </span>
          ))}
        </div>
      </div>

      {/* Fun Facts */}
      {dailyStreak >= 7 && (
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          {dailyStreak >= 30 && (
            <p>🎉 ¡Has estado activo por más de un mes!</p>
          )}
          {dailyStreak >= 100 && (
            <p>🔥 ¡Eres increíblemente dedicado! ¡100+ días!</p>
          )}
          {dailyStreak >= 365 && (
            <p>👑 ¡Leyenda absoluta! ¡Un año completo!</p>
          )}
        </div>
      )}
    </div>
  );
}