// features/settings/components/PreferencesSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '../../../../shared/ui';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('es');
  const [notifications, setNotifications] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Hydration fix for theme
  useEffect(() => {
    setMounted(true);
    
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('fantasix-language') || 'es';
    setLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('fantasix-language', newLanguage);
    toast.success(`Idioma cambiado a ${newLanguage === 'es' ? 'Español' : 'English'}`);
    // TODO: Implement actual i18n when backend supports it
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Tema cambiado a ${newTheme === 'light' ? 'claro' : 'oscuro'}`);
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    toast.success(`Notificaciones ${!notifications ? 'activadas' : 'desactivadas'}`);
    // TODO: Persist to backend when implemented
  };

  if (!mounted) {
    return (
      <Card padding="lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
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
    );
  }

  return (
    <Card padding="lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Preferencias
      </h2>
      
      <div className="space-y-6">
        {/* Language */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Idioma
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selecciona tu idioma preferido
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={language === 'es' ? 'primary' : 'outline'}
              onClick={() => handleLanguageChange('es')}
            >
              🇪🇸 Español
            </Button>
            <Button
              size="sm"
              variant={language === 'en' ? 'primary' : 'outline'}
              onClick={() => handleLanguageChange('en')}
            >
              🇺🇸 English
            </Button>
          </div>
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Tema
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personaliza la apariencia de la aplicación
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={theme === 'light' ? 'primary' : 'outline'}
              onClick={() => handleThemeChange('light')}
            >
              ☀️ Claro
            </Button>
            <Button
              size="sm"
              variant={theme === 'dark' ? 'primary' : 'outline'}
              onClick={() => handleThemeChange('dark')}
            >
              🌙 Oscuro
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between py-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recibe alertas sobre partidos y recompensas
            </p>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                ${notifications ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
              role="switch"
              aria-checked={notifications}
              onClick={handleNotificationsToggle}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                  transition duration-200 ease-in-out
                  ${notifications ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              {notifications ? 'Activado' : 'Desactivado'}
            </span>
            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}