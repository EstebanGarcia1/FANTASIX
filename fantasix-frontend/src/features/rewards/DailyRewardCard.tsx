'use client';

import { useRewardsStatus, useClaimDailyReward } from '../../shared/api/hooks';
import { Button, Card } from '../../shared/ui';
import toast from 'react-hot-toast';

export function DailyRewardCard() {
  const { data: rewardsStatus, isLoading } = useRewardsStatus();
  const claimRewardMutation = useClaimDailyReward();

  const handleClaimReward = async () => {
    try {
      const result = await claimRewardMutation.mutateAsync();
      toast.success(result.message);
    } catch (error) {
      toast.error('Error al reclamar la recompensa');
    }
  };

  if (isLoading || !rewardsStatus) {
    return (
      <Card padding="md" className="relative overflow-hidden">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-siege-gold/10 to-siege-orange/5 rounded-full -mr-12 -mt-12" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recompensa Diaria
          </h3>
          <div className="text-2xl">💰</div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {rewardsStatus.canClaim ? (
            'Reclama tus 50 Siege Points'
          ) : (
            `Racha actual: ${rewardsStatus.dailyStreak} días`
          )}
        </p>

        <Button
          onClick={handleClaimReward}
          disabled={!rewardsStatus.canClaim || claimRewardMutation.isPending}
          loading={claimRewardMutation.isPending}
          className="w-full"
          variant={rewardsStatus.canClaim ? 'primary' : 'outline'}
        >
          {rewardsStatus.canClaim ? 'Reclamar' : 'Ya reclamado'}
        </Button>

        {rewardsStatus.dailyStreak > 0 && (
          <div className="mt-3 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            <span>🔥 {rewardsStatus.dailyStreak} días consecutivos</span>
          </div>
        )}
      </div>
    </Card>
  );
}