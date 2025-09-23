/ app/(private)/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, LoadingSpinner } from '../../../../shared/ui';
import { AccountSection } from '../../../../features/settings/components/AccountSection';
import { PreferencesSection } from '../../../../features/settings/components/PreferencesSection';
import { SecuritySection } from '../../../../features/settings/components/SecuritySection';
import { useProfile } from '../../../../features/profile/hooks/useProfile';
import { useAuth } from '../../../../shared/hooks/useAuth';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
        
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} padding="lg">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                      </div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card padding="lg">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Error al cargar la configuración
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu cuenta, preferencias y configuración de seguridad
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <AccountSection profile={profile} user={user} />
        <PreferencesSection />
        <SecuritySection profile={profile} user={user} />
      </div>
    </div>
  );
}