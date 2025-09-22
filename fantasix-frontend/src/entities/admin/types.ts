// src/entities/admin/types.ts

import { z } from 'zod';

// Admin Config Types
export interface AdminConfig {
  id: number;
  activePhase: 'group' | 'playoffs';
  draftGruposOpen: boolean;
  draftPlayoffsOpen: boolean;
  redraftOpensAt?: string;
  activeTournamentId?: number;
  lastUpdated: string;
}

export interface UpdateConfigRequest {
  activePhase?: 'group' | 'playoffs';
  draftGruposOpen?: boolean;
  draftPlayoffsOpen?: boolean;
  redraftOpensAt?: string;
  activeTournamentId?: number;
}

// Team Types
export interface AdminTeam {
  id: number;
  name: string;
  logoUrl?: string;
  region: string;
  playersCount?: number;
  createdAt: string;
}

export interface CreateTeamRequest {
  name: string;
  logoUrl?: string;
  region: string;
}

export interface UpdateTeamRequest extends CreateTeamRequest {
  id: number;
}

// Player Types
export interface AdminPlayer {
  id: number;
  nickname: string;
  role: 'Entry' | 'Flex' | 'Support';
  region: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  teamId?: number;
  team?: AdminTeam;
  totalPoints: number;
  createdAt: string;
}

export interface CreatePlayerRequest {
  nickname: string;
  role: 'Entry' | 'Flex' | 'Support';
  region: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  teamId?: number;
}

export interface UpdatePlayerRequest extends CreatePlayerRequest {
  id: number;
}

// Match Types
export interface AdminMatch {
  id: number;
  tournamentId?: number;
  teamAId: number;
  teamBId: number;
  teamA: AdminTeam;
  teamB: AdminTeam;
  scheduledTime: string;
  format: 'BO1' | 'BO3' | 'BO5';
  round?: string;
  phase?: string;
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled';
  scoreA: number;
  scoreB: number;
  winnerTeamId?: number;
  mapScores?: string[];
  createdAt: string;
}

export interface CreateMatchRequest {
  tournamentId?: number;
  teamAId: number;
  teamBId: number;
  scheduledTime: string;
  format: 'BO1' | 'BO3' | 'BO5';
  round?: string;
  phase?: string;
}

export interface UpdateMatchRequest extends CreateMatchRequest {
  id: number;
}

export interface CloseMatchRequest {
  matchId: number;
  scoreA: number;
  scoreB: number;
  winnerTeamId?: number;
  mapScores?: string[];
}

// Pagination & Filters
export interface AdminPaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AdminFilters {
  page?: number;
  size?: number;
  search?: string;
}

export interface PlayerFilters extends AdminFilters {
  teamId?: number;
  region?: string;
  role?: 'Entry' | 'Flex' | 'Support';
  status?: 'active' | 'inactive';
}

export interface MatchFilters extends AdminFilters {
  scope?: 'upcoming' | 'recent';
  status?: AdminMatch['status'];
  tournamentId?: number;
}

// Recalculation
export interface RecalculateResponse {
  message: string;
  affectedPlayers: number;
  affectedMatches: number;
  executionTime: string;
}

// Zod Schemas for Validation
export const AdminConfigSchema = z.object({
  activePhase: z.enum(['group', 'playoffs']),
  draftGruposOpen: z.boolean(),
  draftPlayoffsOpen: z.boolean(),
  redraftOpensAt: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'La fecha debe ser futura'),
  activeTournamentId: z.number().optional(),
}).refine((data) => {
  // At least one draft phase should be open
  return data.draftGruposOpen || data.draftPlayoffsOpen;
}, {
  message: 'Al menos una fase de draft debe estar abierta',
  path: ['draftGruposOpen'],
});

export const TeamSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .trim(),
  logoUrl: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  region: z.string()
    .min(1, 'La región es requerida')
    .max(10, 'La región no puede tener más de 10 caracteres'),
});

export const PlayerSchema = z.object({
  nickname: z.string()
    .min(2, 'El nickname debe tener al menos 2 caracteres')
    .max(30, 'El nickname no puede tener más de 30 caracteres')
    .trim(),
  role: z.enum(['Entry', 'Flex', 'Support'], {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
  region: z.string()
    .min(1, 'La región es requerida')
    .max(10, 'La región no puede tener más de 10 caracteres'),
  imageUrl: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'inactive']),
  teamId: z.number()
    .positive('Debe seleccionar un equipo válido')
    .optional(),
});

export const MatchSchema = z.object({
  tournamentId: z.number().positive().optional(),
  teamAId: z.number().positive('Debe seleccionar el equipo A'),
  teamBId: z.number().positive('Debe seleccionar el equipo B'),
  scheduledTime: z.string()
    .min(1, 'La fecha y hora son requeridas')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Fecha inválida'),
  format: z.enum(['BO1', 'BO3', 'BO5']),
  round: z.string().optional(),
  phase: z.string().optional(),
}).refine((data) => {
  return data.teamAId !== data.teamBId;
}, {
  message: 'Los equipos deben ser diferentes',
  path: ['teamBId'],
});

export const CloseMatchSchema = z.object({
  scoreA: z.number()
    .min(0, 'El marcador no puede ser negativo')
    .max(50, 'El marcador parece demasiado alto'),
  scoreB: z.number()
    .min(0, 'El marcador no puede ser negativo')
    .max(50, 'El marcador parece demasiado alto'),
  winnerTeamId: z.number().positive().optional(),
  mapScores: z.array(z.string()).optional(),
}).refine((data) => {
  // At least one team should have scored
  return data.scoreA > 0 || data.scoreB > 0;
}, {
  message: 'Al menos un equipo debe haber anotado',
  path: ['scoreA'],
}).refine((data) => {
  // Scores should be different for a concluded match
  return data.scoreA !== data.scoreB;
}, {
  message: 'Los marcadores no pueden ser iguales en un partido finalizado',
  path: ['scoreB'],
});

// Form Types
export type AdminConfigFormData = z.infer<typeof AdminConfigSchema>;
export type TeamFormData = z.infer<typeof TeamSchema>;
export type PlayerFormData = z.infer<typeof PlayerSchema>;
export type MatchFormData = z.infer<typeof MatchSchema>;
export type CloseMatchFormData = z.infer<typeof CloseMatchSchema>;