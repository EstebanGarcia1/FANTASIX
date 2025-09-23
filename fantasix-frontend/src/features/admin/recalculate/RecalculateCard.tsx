// src/features/admin/recalculate/RecalculateCard.tsx

'use client';

import { useState } from 'react';
import { Button, Card, Modal } from '../../../shared/ui';
import { useRecalculatePoints } from '../hooks/useAdminApi';

export function RecalculateCard() {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const recalculateMutation = useRecalculatePoints();

  const handleRecalculate = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmRecalculate = async () => {
    try {
      await recalculateMutation.mutateAsync();
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Error recalculating points:', error);
      // Error is already handled by the mutation
    }
  };

  const closeModal = () => {
    if (!recalculateMutation.isPending) {
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <>
      <Card padding="lg">
        <div className="text-center max-w-2xl mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      </Modal>
    </>
  );
}

          {/* Title and Description */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recalcular Puntos Globales
          </h3>
          <div className="space-y-3 text-gray-600 dark:text-gray-400 mb-8">
            <p>
              Esta herramienta recalcula todos los puntos del sistema basándose en 
              los resultados actuales de los partidos y las estadísticas de los jugadores.
            </p>
            <p className="text-sm">
              <strong>Usar solo en casos de:</strong>
            </p>
            <ul className="text-sm text-left max-w-md mx-auto space-y-1">
              <li>• Inconsistencias detectadas en puntuaciones</li>
              <li>• Después de cambios en el algoritmo de puntuación</li>
              <li>• Corrección de datos históricos</li>
              <li>• Migración o restauración de datos</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-left">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  ⚠️ Operación crítica
                </h4>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <p>• Este proceso puede tomar varios minutos</p>
                  <p>• Afectará a todos los rankings y leaderboards</p>
                  <p>• Los usuarios verán cambios inmediatamente</p>
                  <p>• <strong>No interrumpir</strong> el proceso una vez iniciado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleRecalculate}
            disabled={recalculateMutation.isPending}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Iniciar Recálculo
          </Button>

          {/* Status Information */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <p>
                <strong>Tiempo estimado:</strong> 30 segundos - 5 minutos
              </p>
              <p>
                <strong>Última ejecución:</strong> Información no disponible
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={closeModal}
        title="Confirmar Recálculo de Puntos"
      >
        <div className="space-y-6">
          {/* Confirmation Message */}
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ¿Estás completamente seguro?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Este proceso recalculará <strong>todos los puntos</strong> del sistema 
              y afectará a todos los usuarios y rankings.
            </p>
          </div>

          {/* Impact List */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Lo que se verá afectado:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Puntos de todos los jugadores</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Rankings y leaderboards</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Equipos fantasy de usuarios</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Estadísticas históricas</span>
              </li>
            </ul>
          </div>

          {/* Loading State */}
          {recalculateMutation.isPending && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Recálculo en progreso...
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    No cierres esta ventana. El proceso se completará automáticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={recalculateMutation.isPending}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmRecalculate}
              loading={recalculateMutation.isPending}
              disabled={recalculateMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {recalculateMutation.isPending ? 'Recalculando...' : 'Sí, Recalcular'}
            </Button>
          </div>