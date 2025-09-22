'use client';

import { Card, LoadingSpinner } from '../../../../shared/ui';

export default function MatchesPage() {
  return (
    <div className="container-responsive py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Partidos
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Calendario y resultados de los torneos
        </p>
      </div>

      <Card padding="lg">
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Calendario de Partidos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sistema de brackets y resultados en tiempo real próximamente.
          </p>
          <LoadingSpinner />
        </div>
      </Card>
    </div>
  );
}