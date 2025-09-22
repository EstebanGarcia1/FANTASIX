import type { Player } from '../../../entities/types';

export interface DraftValidationResult {
  valid: boolean;
  errors: string[];
}

export interface RoleCounts {
  Entry: number;
  Flex: number;
  Support: number;
}

export interface TeamCounts {
  [teamName: string]: number;
}

/**
 * Valida las reglas del draft fantasy
 * @param allPlayers - Lista completa de jugadores disponibles
 * @param selectedIds - IDs de jugadores seleccionados
 * @returns Resultado de validación con errores específicos
 */
export function validateDraft(
  allPlayers: Player[],
  selectedIds: string[]
): DraftValidationResult {
  const errors: string[] = [];

  // 1. Verificar que se seleccionaron exactamente 5 jugadores
  if (selectedIds.length !== 5) {
    errors.push(`Debes seleccionar exactamente 5 jugadores (tienes ${selectedIds.length})`);
  }

  // Si no hay jugadores seleccionados, retornar early
  if (selectedIds.length === 0) {
    return { valid: false, errors };
  }

  // Obtener jugadores seleccionados
  const selectedPlayers = allPlayers.filter(player => 
    selectedIds.includes(player.id.toString())
  );

  // 2. Contar roles
  const roleCounts = countRoles(selectedPlayers);
  
  // Verificar roles mínimos
  if (roleCounts.Entry < 1) {
    errors.push('Necesitas al menos 1 jugador Entry');
  }
  if (roleCounts.Flex < 1) {
    errors.push('Necesitas al menos 1 jugador Flex');
  }
  if (roleCounts.Support < 1) {
    errors.push('Necesitas al menos 1 jugador Support');
  }

  // 3. Verificar máximo 2 jugadores por equipo
  const teamCounts = countTeams(selectedPlayers);
  const violatingTeams = Object.entries(teamCounts)
    .filter(([, count]) => count > 2)
    .map(([teamName]) => teamName);

  if (violatingTeams.length > 0) {
    errors.push(
      `Máximo 2 jugadores por equipo. Exceso en: ${violatingTeams.join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Cuenta jugadores por rol
 */
export function countRoles(players: Player[]): RoleCounts {
  return players.reduce(
    (counts, player) => {
      const role = player.role || 'Unknown';
      if (role === 'Entry' || role === 'Flex' || role === 'Support') {
        counts[role]++;
      }
      return counts;
    },
    { Entry: 0, Flex: 0, Support: 0 } as RoleCounts
  );
}

/**
 * Cuenta jugadores por equipo
 */
export function countTeams(players: Player[]): TeamCounts {
  return players.reduce((counts, player) => {
    const teamName = player.Team?.name || 'Sin equipo';
    counts[teamName] = (counts[teamName] || 0) + 1;
    return counts;
  }, {} as TeamCounts);
}

/**
 * Verifica si un jugador puede ser seleccionado
 * considerando las restricciones actuales
 */
export function canSelectPlayer(
  player: Player,
  currentSelection: Player[],
  maxTeamPlayers: number = 2
): { canSelect: boolean; reason?: string } {
  // Si ya está seleccionado, siempre se puede "deseleccionar"
  const isAlreadySelected = currentSelection.some(p => p.id === player.id);
  if (isAlreadySelected) {
    return { canSelect: true };
  }

  // Verificar límite total de jugadores
  if (currentSelection.length >= 5) {
    return { 
      canSelect: false, 
      reason: 'Ya tienes 5 jugadores seleccionados' 
    };
  }

  // Verificar límite por equipo
  const teamName = player.Team?.name || 'Sin equipo';
  const currentTeamCount = currentSelection.filter(
    p => (p.Team?.name || 'Sin equipo') === teamName
  ).length;

  if (currentTeamCount >= maxTeamPlayers) {
    return { 
      canSelect: false, 
      reason: `Ya tienes ${maxTeamPlayers} jugadores de ${teamName}` 
    };
  }

  return { canSelect: true };
}

/**
 * Obtiene los roles que aún faltan por cubrir
 */
export function getMissingRoles(players: Player[]): string[] {
  const counts = countRoles(players);
  const missing: string[] = [];

  if (counts.Entry < 1) missing.push('Entry');
  if (counts.Flex < 1) missing.push('Flex');
  if (counts.Support < 1) missing.push('Support');

  return missing;
}