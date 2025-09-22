'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

import { Card, LoadingSpinner, EmptyState, Modal, Button } from '../../../../shared/ui';
import { DraftFilters } from '../../../../features/draft/components/DraftFilters';
import { PlayerCard } from '../../../../features/draft/components/PlayerCard';
import { DraftSummary } from '../../../../features/draft/components/DraftSummary';

import { 
  useConfig, 
  usePlayers, 
  useMyFantasyTeam,
  useSubmitFantasyTeam
} from '../../../../shared/api/hooks';

import type { Player, PlayerFilters, FantasyPhase } from '../../../../entities/types';

export default function DraftPage() {
  const searchParams = useSearchParams();
  const phaseFromUrl = searchParams.get('phase') as FantasyPhase | null;

  // State
  const [activePhase, setActivePhase] = useState<FantasyPhase>(
    phaseFromUrl || 'group'
  );
  const [filters, setFilters] = useState<PlayerFilters>({
    limit: 50,
  });
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Data fetching
  const { data: config, isLoading: configLoading } = useConfig();
  const { data: players = [], isLoading: playersLoading } = usePlayers(filters);
  const { data: myTeam, isLoading: teamLoading } = useMyFantasyTeam(activePhase);
  const submitTeamMutation = useSubmitFantasyTeam();

  // Determine if draft is open
  const isDraftOpen = activePhase === 'group' 
    ? config?.draftGruposOpen 
    : config?.draftPlayoffsOpen;

  // Load existing team on mount
  useEffect(() => {
    if (myTeam?.picks) {
      const teamPlayers = myTeam.picks
        .sort((a, b) => a.position - b.position)
        .map(pick => pick.player);
      setSelectedPlayers(teamPlayers);
    }
  }, [myTeam]);

  // Handlers
  const handlePlayerToggle = (player: Player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    
    if (isSelected) {
      setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length < 5) {
        setSelectedPlayers(prev => [...prev, player]);
      }
    }
  };

  const handleRemovePlayer = (player: Player) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
  };

  const handleConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleSubmit = async () => {
    try {
      const playerIds = selectedPlayers.map(p => p.id.toString());
      
      await submitTeamMutation.mutateAsync({
        phase: activePhase,
        players: playerIds,
        allPlayers: players,
      });

      toast.success('¡Equipo guardado correctamente!');
      setShowConfirmModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el equipo');
    }
  };

  // Countdown logic for redraft
  const getCountdownText = () => {
    if (!config?.redraftOpensAt) return null;
    
    const now = new Date();
    const redraftDate = new Date(config.redraftOpensAt);
    const diff = redraftDate.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (configLoading || teamLoading) {
    return (
      <div className="container-responsive py-6">
        <LoadingSpinner className="mx-auto" />
      </div>
    );
  }

  return (
    <div className="container-responsive py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Draft Fantasy
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Construye tu equipo de 5 jugadores profesionales
            </p>
          </div>

          {/* Phase Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mt-4 sm:mt-0">
            <button
              onClick={() => setActivePhase('group')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activePhase === 'group'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Grupos {config?.draftGruposOpen ? '🟢' : '🔴'}
            </button>
            <button
              onClick={() => setActivePhase('playoffs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activePhase === 'playoffs'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Playoffs {config?.draftPlayoffsOpen ? '🟢' : '🔴'}
            </button>
          </div>
        </div>

        {/* Draft Status */}
        <div className="mt-4">
          {isDraftOpen ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Draft de {activePhase === 'group' ? 'Grupos' : 'Playoffs'} abierto
            </div>
          ) : (
            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Draft cerrado
              </div>
              {getCountdownText() && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Redraft abre en: <span className="font-mono font-medium">{getCountdownText()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Filters & Players */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <DraftFilters
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={playersLoading}
          />

          {/* Players List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Jugadores Disponibles
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {players.length} jugadores
              </span>
            </div>

            {playersLoading ? (
              <div className="space-y-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} padding="md" className="animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : players.length === 0 ? (
              <EmptyState
                title="No se encontraron jugadores"
                description="Intenta ajustar los filtros para encontrar jugadores"
              />
            ) : (
              <div className="space-y-3">
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayers.some(p => p.id === player.id)}
                    selectedPlayers={selectedPlayers}
                    onToggle={handlePlayerToggle}
                    disabled={!isDraftOpen}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Draft Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <DraftSummary
              selectedPlayers={selectedPlayers}
              allPlayers={players}
              onRemovePlayer={handleRemovePlayer}
              onConfirm={handleConfirm}
              isSubmitting={submitTeamMutation.isPending}
              disabled={!isDraftOpen}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Equipo Fantasy"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que quieres confirmar este equipo para la fase de{' '}
            <span className="font-medium">
              {activePhase === 'group' ? 'Grupos' : 'Playoffs'}
            </span>?
          </p>

          {/* Team Preview */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Resumen del equipo:
            </h4>
            <div className="space-y-2">
              {selectedPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span className="font-medium">{player.nickname}</span>
                    <span className="text-gray-500">({player.role})</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {player.Team?.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm font-medium">
                <span>Puntos totales:</span>
                <span>{selectedPlayers.reduce((sum, p) => sum + p.totalPoints, 0)}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
              disabled={submitTeamMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitTeamMutation.isPending}
              className="flex-1"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}'use client';

import { Card, LoadingSpinner } from '../../../../src/shared/ui';

export default function DraftPage() {
  return (
    <div className="container-responsive py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Draft Fantasy
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Construye tu equipo perfecto
        </p>
      </div>

      <Card padding="lg">
        <div className="text-center">
          <LoadingSpinner className="mb-4" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Próximamente
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            La funcionalidad de draft estará disponible en la próxima versión.
          </p>
        </div>
      </Card>
    </div>
  );
}