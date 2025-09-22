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
  myPosition?: number;
}

export function JumpToMeBar({ 
  phase, 
  currentPage, 
  pageSize, 
  onPageChange,
  myPosition 
}: JumpToMeBarProps) {
  const [isJumping, setIsJumping] = useState(false);
  const { jumpToPosition } = useJumpToMyPosition();

  const handleJumpToMe = async () => {
    if (!myPosition) {
      // If we don't have the user's position, we could fetch it
      // For now, we'll use a mock position for demo
      const mockPosition = 127; // Example position
      
      setIsJumping(true);
      try {
        const targetPage = calculatePageForPosition(mockPosition, pageSize);
        
        if (targetPage === currentPage) {
          toast.success('¡Ya estás en tu página!');
        } else {
          await jumpToPosition(mockPosition, phase, pageSize);
          onPageChange(targetPage);
          toast.success(`Saltando a la página ${targetPage} (posición ${mockPosition})`);
        }
      } catch (error) {
        toast.error('Error al buscar tu posición');
      } finally {
        setIsJumping(false);
      }
      return;
    }

    setIsJumping(true);
    try {
      const targetPage = calculatePageForPosition(myPosition, pageSize);
      
      if (targetPage === currentPage) {
        toast.success('¡Ya estás en tu página!');
      } else {
        await jumpToPosition(myPosition, phase, pageSize);
        onPageChange(targetPage);
        toast.success(`Saltando a la página ${targetPage} (posición ${myPosition})`);
      }
    } catch (error) {
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

  return (
    <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-brand-900 dark:text-brand-100">
            Tu posición: #{myPosition || '???'}
          </p>
          <p className="text-xs text-brand-600 dark:text-brand-400">
            Estás en la página {myPosition ? calculatePageForPosition(myPosition, pageSize) : '???'}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleJumpToMe}
        loading={isJumping}
        className="flex items-center space-x-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span>Ir a mi posición</span>
      </Button>
    </div>
  );
}