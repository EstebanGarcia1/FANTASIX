// src/shared/components/AppNavigation.tsx - Updated with Admin Link (completo)

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../api/hooks'; // Debe devolver { isAdmin: boolean } en data
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar, Button } from '../ui';

export function AppNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: profile } = useUserProfile();

  const navigation: { name: string; href: string; icon: string }[] = [
    { name: 'Dashboard', href: '/app', icon: '🏠' },
    { name: 'Draft', href: '/app/draft', icon: '⚡' },
    { name: 'Ranking', href: '/app/leaderboard', icon: '🏆' },
    { name: 'Jugadores', href: '/app/players', icon: '👥' },
    { name: 'Partidos', href: '/app/matches', icon: '⚔️' },
    { name: 'Perfil', href: '/app/profile', icon: '⚙️' },
  ];

  // Add Admin link for admin users
  if (profile?.isAdmin) {
    navigation.push({ name: 'Admin', href: '/app/admin', icon: '👑' });
  }

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/app" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gradient">Fantasix</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    item.name === 'Admin'
                      ? isActive(item.href)
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800'
                        : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300'
                      : isActive(item.href)
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.name === 'Admin' && (
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
                      Admin
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <Avatar
                  src={user?.photoURL || undefined}
                  alt={user?.displayName || user?.email || 'Usuario'}
                  size="sm"
                  fallback={user?.displayName?.[0] || user?.email?.[0] || 'U'}
                />
                <div className="hidden lg:block">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.displayName || 'Usuario'}
                    </p>
                    {profile?.isAdmin && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Abrir menú"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 pt-4 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2 rounded-md text-base font-medium',
                    isActive(item.href)
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'text-gray-600 dark:text-gray-300'
                  )}
                >
                  <span className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                  {item.name === 'Admin' && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
                      Admin
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile User Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar
                  src={user?.photoURL || undefined}
                  alt={user?.displayName || user?.email || 'Usuario'}
                  size="sm"
                  fallback={user?.displayName?.[0] || user?.email?.[0] || 'U'}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.displayName || 'Usuario'}
                    </p>
                    {profile?.isAdmin && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
