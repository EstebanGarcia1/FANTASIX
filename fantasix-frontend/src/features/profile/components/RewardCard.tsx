// src/features/profile/components/RewardCard.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '../../../shared/ui';
import { StreakIndicator } from './StreakIndicator';
import { useClaimDailyReward } from '../hooks/useProfile';
import type { RewardsStatus } from '../../../entities/profile/types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface RewardCardProps {
  rewards: RewardsStatus;
  isLoading?: boolean;
}

function formatTimeUntilNextClaim(nextClaimAt?: string): string {
  if (!nextClaimAt) return '';
  
  const now = new Date();
  const nextClaim = new Date(nextClaimAt);
  const diff = nextClaim.getTime() - now.getTime();
  
  if (diff <= 0) return '';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `en ${hours}h ${minutes}m`;
  }
  
  return `en ${minutes}m`;
}

function Countdown({ nextClaimAt }: { nextClaimAt?: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextClaimAt) return;

    const updateCountdown = () => {
      setTimeLeft(formatTimeUntilNextClaim(nextClaimAt));
    };

    updateCountdown(); // Initial update
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextClaimAt]);

  if (!timeLeft) return null;

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
      Próxima recompensa disponible {timeLeft}
    </div>
  );
}

export function RewardCard({ rewards, isLoading }: RewardCardProps) {
  const claimRewardMutation = useClaimDailyReward();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClaimReward = async () => {
    try {
      const result = await claimRewardMutation.mutateAsync();
      
      // Show success message
      toast.success(result.message, {
        duration: 4000,
        icon: '🎉',
      });
      
      // Trigger confetti effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
    } catch (error: any) {
      toast.error(error.message || 'Error al reclamar la recompensa');
    }
  };

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      padding="lg" 
      className={clsx(
        'relative overflow-hidden transition-all duration-300',
        rewards.canClaim && 'ring-2 ring-brand-300 border-brand-300 bg-gradient-to-br from-brand-50/50 to-siege-gold/10 dark:from-brand-900/20 dark:to-siege-gold/5',
        showConfetti && 'animate-pulse-slow'
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-siege-gold/10 to-siege-orange/5 rounded-full -mr-16 -mt-16" />
      
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-bounce">
            🎉
          </div>
        </div>
      )}

      <div className="relative space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="text-3xl">💰</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recompensa Diaria
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Siege Points gratuitos cada 24 horas
          </p>
        </div>

        {/* Streak Indicator */}
        <StreakIndicator dailyStreak={rewards.dailyStreak} />

        {/* Claim Section */}
        <div className="text-center space-y-4">
          {rewards.canClaim ? (
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
                <span className="text-brand-600 dark:text-brand-400 font-medium">
                  +50 Siege Points disponibles
                </span>
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
              </div>
              
              <Button
                onClick={handleClaimReward}
                loading={claimRewardMutation.isPending}
                disabled={claimRewardMutation.isPending}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {claimRewardMutation.isPending ? (
                  'Reclamando...'
                ) : (
                  <>
                    <span className="mr-2">🎁</span>
                    Reclamar Recompensa
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">
                  ✅ Recompensa ya reclamada hoy
                </span>
              </div>
              
              <Button
                disabled
                variant="outline"
                className="w-full h-12 text-base"
                size="lg"
              >
                <span className="mr-2">⏰</span>
                Ya reclamado hoy
              </Button>
              
              <Countdown nextClaimAt={rewards.nextClaimAt} />
            </div>
          )}

          {/* Last claim info */}
          {rewards.lastClaim && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Última reclamación: {new Date(rewards.lastClaim).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                50 SP
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Recompensa base
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                24h
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Cooldown
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        {rewards.dailyStreak < 7 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="text-blue-500 text-sm">💡</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Consejo:</strong> Mantén tu racha para desbloquear recompensas más grandes en el futuro.
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}