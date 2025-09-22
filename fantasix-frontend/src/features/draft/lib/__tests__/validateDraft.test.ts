import { describe, it, expect } from '@jest/globals';
import { validateDraft, canSelectPlayer, countRoles, countTeams, getMissingRoles } from '../validateDraft';
import type { Player } from '../../../../entities/types';

// Mock players para tests
const mockPlayers: Player[] = [
  {
    id: 1,
    nickname: 'Player1',
    role: 'Entry',
    totalPoints: 100,
    Team: { id: 1, name: 'Team A', logoUrl: 'logo1.png' }
  },
  {
    id: 2,
    nickname: 'Player2',
    role: 'Flex',
    totalPoints: 150,
    Team: { id: 1, name: 'Team A', logoUrl: 'logo1.png' }
  },
  {
    id: 3,
    nickname: 'Player3',
    role: 'Support',
    totalPoints: 120,
    Team: { id: 2, name: 'Team B', logoUrl: 'logo2.png' }
  },
  {
    id: 4,
    nickname: 'Player4',
    role: 'Entry',
    totalPoints: 90,
    Team: { id: 2, name: 'Team B', logoUrl: 'logo2.png' }
  },
  {
    id: 5,
    nickname: 'Player5',
    role: 'Flex',
    totalPoints: 110,
    Team: { id: 3, name: 'Team C', logoUrl: 'logo3.png' }
  },
  {
    id: 6,
    nickname: 'Player6',
    role: 'Entry',
    totalPoints: 95,
    Team: { id: 1, name: 'Team A', logoUrl: 'logo1.png' }
  },
] as Player[];

describe('validateDraft', () => {
  describe('Casos válidos', () => {
    it('debería validar correctamente un equipo válido con 5 jugadores cumpliendo roles y ≤2 por equipo', () => {
      const selectedIds = ['1', '2', '3', '4', '5']; // Entry, Flex, Support, Entry, Flex
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debería validar correctamente con exactamente 2 jugadores del mismo equipo', () => {
      const selectedIds = ['1', '2', '3', '4', '5']; // Player1 y Player2 son de Team A
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Error: roles insuficientes', () => {
    it('debería fallar si falta Entry', () => {
      const playersWithoutEntry = mockPlayers.filter(p => p.role !== 'Entry').slice(0, 5);
      const selectedIds = playersWithoutEntry.map(p => p.id.toString());
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Entry'))).toBe(true);
    });

    it('debería fallar si falta Flex', () => {
      const playersWithoutFlex = mockPlayers.filter(p => p.role !== 'Flex').slice(0, 5);
      const selectedIds = playersWithoutFlex.map(p => p.id.toString());
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Flex'))).toBe(true);
    });

    it('debería fallar si falta Support', () => {
      const playersWithoutSupport = mockPlayers.filter(p => p.role !== 'Support').slice(0, 5);
      const selectedIds = playersWithoutSupport.map(p => p.id.toString());
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Support'))).toBe(true);
    });
  });

  describe('Error: exceso por equipo', () => {
    it('debería fallar con 3 jugadores del mismo equipo', () => {
      // Team A tiene jugadores 1, 2, 6
      const selectedIds = ['1', '2', '6', '3', '4']; 
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Team A'))).toBe(true);
    });
  });

  describe('Error: número incorrecto de jugadores', () => {
    it('debería fallar con menos de 5 jugadores', () => {
      const selectedIds = ['1', '2', '3'];
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exactamente 5 jugadores'))).toBe(true);
    });

    it('debería fallar con más de 5 jugadores', () => {
      const selectedIds = ['1', '2', '3', '4', '5', '6'];
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exactamente 5 jugadores'))).toBe(true);
    });

    it('debería fallar con 0 jugadores', () => {
      const selectedIds: string[] = [];
      const result = validateDraft(mockPlayers, selectedIds);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exactamente 5 jugadores'))).toBe(true);
    });
  });
});

describe('canSelectPlayer', () => {
  it('debería permitir seleccionar un jugador cuando hay espacio', () => {
    const currentSelection = mockPlayers.slice(0, 2);
    const playerToSelect = mockPlayers[2];

    const result = canSelectPlayer(playerToSelect, currentSelection);

    expect(result.canSelect).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('debería permitir deseleccionar un jugador ya seleccionado', () => {
    const currentSelection = mockPlayers.slice(0, 3);
    const playerToDeselect = mockPlayers[1];

    const result = canSelectPlayer(playerToDeselect, currentSelection);

    expect(result.canSelect).toBe(true);
  });

  it('debería impedir seleccionar cuando ya hay 5 jugadores', () => {
    const currentSelection = mockPlayers.slice(0, 5);
    const playerToSelect = mockPlayers[5];

    const result = canSelectPlayer(playerToSelect, currentSelection);

    expect(result.canSelect).toBe(false);
    expect(result.reason).toBe('Ya tienes 5 jugadores seleccionados');
  });

  it('debería impedir seleccionar cuando ya hay 2 del mismo equipo', () => {
    const currentSelection = [mockPlayers[0], mockPlayers[1]]; // Ambos de Team A
    const playerToSelect = mockPlayers[5]; // También de Team A

    const result = canSelectPlayer(playerToSelect, currentSelection);

    expect(result.canSelect).toBe(false);
    expect(result.reason).toBe('Ya tienes 2 jugadores de Team A');
  });
});

describe('Funciones auxiliares', () => {
  describe('countRoles', () => {
    it('debería contar correctamente los roles', () => {
      const players = mockPlayers.slice(0, 4); // Entry, Flex, Support, Entry
      const counts = countRoles(players);

      expect(counts.Entry).toBe(2);
      expect(counts.Flex).toBe(1);
      expect(counts.Support).toBe(1);
    });
  });

  describe('countTeams', () => {
    it('debería contar correctamente los equipos', () => {
      const players = [mockPlayers[0], mockPlayers[1], mockPlayers[2]]; // 2 de Team A, 1 de Team B
      const counts = countTeams(players);

      expect(counts['Team A']).toBe(2);
      expect(counts['Team B']).toBe(1);
    });
  });

  describe('getMissingRoles', () => {
    it('debería identificar roles faltantes', () => {
      const playersWithoutSupport = mockPlayers.filter(p => p.role !== 'Support').slice(0, 3);
      const missing = getMissingRoles(playersWithoutSupport);

      expect(missing).toContain('Support');
      expect(missing).not.toContain('Entry');
      expect(missing).not.toContain('Flex');
    });

    it('debería retornar array vacío cuando todos los roles están cubiertos', () => {
      const playersWithAllRoles = [
        mockPlayers.find(p => p.role === 'Entry')!,
        mockPlayers.find(p => p.role === 'Flex')!,
        mockPlayers.find(p => p.role === 'Support')!,
      ];
      const missing = getMissingRoles(playersWithAllRoles);

      expect(missing).toHaveLength(0);
    });
  });
});