/**
 * Calcula en qué página se encuentra una posición específica
 * @param position - Posición en el ranking (1-based)
 * @param pageSize - Tamaño de página
 * @returns Número de página (1-based)
 */
export function calculatePageForPosition(position: number, pageSize: number): number {
  if (position <= 0 || pageSize <= 0) {
    throw new Error('Position and pageSize must be positive integers');
  }
  
  return Math.ceil(position / pageSize);
}

/**
 * Calcula el rango de posiciones para una página específica
 * @param page - Número de página (1-based)
 * @param pageSize - Tamaño de página
 * @returns Objeto con startPosition y endPosition
 */
export function calculatePageRange(page: number, pageSize: number): {
  startPosition: number;
  endPosition: number;
} {
  if (page <= 0 || pageSize <= 0) {
    throw new Error('Page and pageSize must be positive integers');
  }

  const startPosition = (page - 1) * pageSize + 1;
  const endPosition = page * pageSize;

  return { startPosition, endPosition };
}

/**
 * Verifica si una posición está dentro del rango de una página
 * @param position - Posición a verificar
 * @param page - Número de página
 * @param pageSize - Tamaño de página
 * @returns true si la posición está en la página
 */
export function isPositionInPage(position: number, page: number, pageSize: number): boolean {
  const { startPosition, endPosition } = calculatePageRange(page, pageSize);
  return position >= startPosition && position <= endPosition;
}

/**
 * Formatea un número de posición para mostrar empates
 * @param position - Posición original
 * @param totalPoints - Puntos del usuario
 * @param allRows - Todos los rows para detectar empates
 * @returns String formateado (ej: "=7" para empates)
 */
export function formatPosition(
  position: number, 
  totalPoints: number, 
  allRows: Array<{ position: number; pointsTotal: number }>
): string {
  // Buscar si hay otros con el mismo puntaje
  const sameScoreRows = allRows.filter(row => row.pointsTotal === totalPoints);
  
  if (sameScoreRows.length > 1) {
    // Hay empate, encontrar la posición más alta
    const highestPosition = Math.min(...sameScoreRows.map(row => row.position));
    const isFirstWithScore = position === highestPosition;
    
    if (!isFirstWithScore) {
      return `=${highestPosition}`;
    }
  }
  
  return position.toString();
}

/**
 * Genera números de página para mostrar en la paginación
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas
 * @param maxVisible - Máximo de páginas a mostrar (default: 5)
 * @returns Array de números de página
 */
export function generatePageNumbers(
  currentPage: number, 
  totalPages: number, 
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // Ajustar si estamos cerca del final
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Valida filtros de leaderboard
 * @param filters - Filtros a validar
 * @returns Filtros validados y sanitizados
 */
export function validateLeaderboardFilters(filters: {
  phase?: string;
  page?: string | number;
  size?: string | number;
  search?: string;
}): {
  phase: 'group' | 'playoffs';
  page: number;
  size: number;
  search?: string;
} {
  const phase = filters.phase === 'playoffs' ? 'playoffs' : 'group';
  
  const page = Math.max(1, parseInt(String(filters.page || 1), 10) || 1);
  const size = Math.min(100, Math.max(10, parseInt(String(filters.size || 50), 10) || 50));
  
  const search = filters.search?.trim() || undefined;

  return { phase, page, size, search };
}