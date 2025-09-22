'use client';

import { useState } from 'react';
import { Button } from '../../../shared/ui';
import { useJumpToMyPosition, calculatePageForPosition } from '../hooks/useLeaderboard';
import type { FantasyPhase } from '../../../entities/types';
import toast from 'react-hot-toast';

interface JumpToMeBarProps {
  phase: FantasyPhase;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onScrollToPosition?: (position: number) => void;
  myPosition?: number;
}

export function JumpToMeBar({ 
  phase, 
  currentPage, 
  pageSize, 
  onPageChange,
  onScrollToPosition,
  myPosition 
}: JumpToMeBarProps) {
  const [isJumping, setIsJumping] = useState(false);
  const { jumpToPosition } = useJumpToMyPosition();

  const handleJumpToMe = async () => {
    if (!myPosition) {
      toast.error('No se encontró tu posición en el ranking');
      return;
    }

    setIsJumping(true);
    try {
      const targetPage = calculatePageForPosition(myPosition, pageSize);
      
      if (targetPage === currentPage) {
        // Same page, just scroll to position
        onScrollToPosition?.(myPosition);
        toast.success('¡Ya estás en tu página! Desplazándose a tu posición...');
      } else {
        // Different page, prefetch and navigate
        await jumpToPosition(myPosition, phase, pageSize);
        onPageChange(targetPage);
        toast.success(`Saltando a la página ${targetPage} (posición #${myPosition})`);
      }
    } catch (error) {
      console.error('Error jumping to position:', error);
      toast.error('Error al buscar tu posición');
    } finally {
      setIsJumping(false);
    }
  };

  // Don't show if user is in current page range
  const startPosition = (currentPage - 1) * pageSize + 1;
  const endPosition = currentPage * pageSize;
  const isInCurrentPage = myPosition && myPosition >= startPosition && myPosition <= endPosition;

  if (isInCurrentPage) {
    return null;
  }

  const targetPage = myPosition ? calculatePageForPosition(myPosition, pageSize) : null;

  return (
    <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-800 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-brand-900 dark:text-brand-100">
            Tu posición actual: #{myPosition || '???'}
          </p>
          <p className="text-xs text-brand-600 dark:text-brand-400">
            {targetPage ? `Página ${targetPage}` : 'Calculando página...'}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleJumpToMe}
        disabled={!myPosition || isJumping}
        loading={isJumping}
        className="flex items-center space-x-2"
        aria-label={`Ir a mi posición #${myPosition || '???'}`}
        title={!myPosition ? 'Tu posición no está disponible' : undefined}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span>Ir a mi posición</span>
      </Button>
    </div>
  );
}