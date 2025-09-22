'use client';

import { Card } from '../../../shared/ui';
import { countRoles, getMissingRoles } from '../lib/validateDraft';
import type { Player } from '../../../entities/types';
import { clsx } from 'clsx';

interface RoleRequirementsProps {
  selectedPlayers: Player[];
}

export function RoleRequirements({ selectedPlayers }: RoleRequirementsProps) {
  const roleCounts = countRoles(selectedPlayers);
  const missingRoles = getMissingRoles(selectedPlayers);

  const roles = [
    { name: 'Entry', count: roleCounts.Entry, required: 1, color: 'red' },
    { name: 'Flex', count: roleCounts.Flex, required: 1, color: 'blue' },
    { name: 'Support', count: roleCounts.Support, required: 1, color: 'green' },
  ] as const;

  return (
    <Card padding="md">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Requisitos de Roles
      </h4>

      <div className="space-y-2">
        {roles.map((role) => {
          const isFulfilled = role.count >= role.required;
          
          return (
            <div key={role.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={clsx(
                    'w-3 h-3 rounded-full',
                    isFulfilled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
                <span
                  className={clsx(
                    'text-sm font-medium',
                    role.color === 'red' && 'text-red-700 dark:text-red-300',
                    role.color === 'blue' && 'text-blue-700 dark:text-blue-300',
                    role.color === 'green' && 'text-green-700 dark:text-green-300'
                  )}
                >
                  {role.name}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={clsx(
                    'text-sm',
                    isFulfilled
                      ? 'text-green-600 dark:text-green-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {role.count}/{role.required}
                </span>
                {isFulfilled && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {missingRoles.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <span className="font-medium">Roles pendientes:</span> {missingRoles.join(', ')}
          </p>
        </div>
      )}
    </Card>
  );
}