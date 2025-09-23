// src/app/(private)/app/admin/page.tsx

'use client';

import { useState } from 'react';
import { AdminGuard } from '../../../../shared/guards/AdminGuard';
import { AdminTabs, type AdminTab } from '../../../../features/admin/components/AdminTabs';
import { AdminConfigForm } from '../../../../features/admin/config/AdminConfigForm';
import { TeamsTable } from '../../../../features/admin/teams/TeamsTable';
import { PlayersTable } from '../../../../features/admin/players/PlayersTable';
import { MatchesSection } from '../../../../features/admin/matches/MatchesSection';
import { RecalculateCard } from '../../../../features/admin/recalculate/RecalculateCard';
import type { AdminFilters, PlayerFilters, MatchFilters } from '../../../../entities/admin/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('config');
  
  // Filters state for different sections
  const [teamsFilters, setTeamsFilters] = useState<AdminFilters>({
    page: 1,
    size: 20,
  });
  
  const [playersFilters, setPlayersFilters] = useState<PlayerFilters>({
    page: 1,
    size: 20,
  });
  
  const [matchesFilters, setMatchesFilters] = useState<MatchFilters>({
    scope: 'upcoming',
    page: 1,
    size: 20,
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'config':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Configuración Global del Sistema
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Gestiona la configuración general de las fases de draft, estado del sistema y timing de redrafts.
              </p>
            </div>