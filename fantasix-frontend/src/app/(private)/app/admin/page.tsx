'use client';

import { Card, LoadingSpinner } from '../../../../shared/ui';

export default function AdminPage() {
  return (
    <div className="container-responsive py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel de Administración
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Gestión de torneos, partidos y configuración
        </p>
      </div>

      <Card padding="lg">
        <div className="text-center">
          <div className="text-4xl mb-4">👑</div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Panel Administrativo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Herramientas de administración disponibles próximamente.
          </p>
          <LoadingSpinner />
        </div>
      </Card>
    </div>
  );
}