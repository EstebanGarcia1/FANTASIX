// src/features/admin/hooks/useAdminApi.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import httpClient from '../../../shared/api/http';
import type {
  AdminConfig,
  UpdateConfigRequest,
  AdminTeam,
  CreateTeamRequest,
  UpdateTeamRequest,
  AdminPlayer,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  AdminMatch,
  CreateMatchRequest,
  UpdateMatchRequest,
  CloseMatchRequest,
  RecalculateResponse,
  AdminPaginatedResponse,
  AdminFilters,
  PlayerFilters,
  MatchFilters,
} from '../../../entities/admin/types';

// Query Keys
export const adminQueryKeys = {
  config: ['admin', 'config'] as const,
  teams: (filters?: AdminFilters) => ['admin', 'teams', filters] as const,
  players: (filters?: PlayerFilters) => ['admin', 'players', filters] as const,
  matches: (filters?: MatchFilters) => ['admin', 'matches', filters] as const,
  recalculate: ['admin', 'recalculate'] as const,
};

// Config Hooks
export function useAdminConfig() {
  return useQuery({
    queryKey: adminQueryKeys.config,
    queryFn: async () => {
      const response = await httpClient.get<{ config: AdminConfig }>('/config');
      return response.config;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateConfigRequest) => {
      return await httpClient.post<AdminConfig>('/admin/config', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.config });
      // Invalidate global config used by other parts of the app
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success('Configuración actualizada correctamente');
    },
    onError: (error: any) => {
      console.error('Error updating config:', error);
      toast.error(error.message || 'Error al actualizar la configuración');
    },
  });
}

// Teams Hooks
export function useAdminTeams(filters: AdminFilters = {}) {
  return useQuery({
    queryKey: adminQueryKeys.teams(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.size) params.set('size', filters.size.toString());
      if (filters.search) params.set('q', filters.search);

      const query = params.toString();
      const path = `/teams${query ? `?${query}` : ''}`;
      
      return await httpClient.get<AdminPaginatedResponse<AdminTeam>>(path);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTeamRequest) => {
      return await httpClient.post<AdminTeam>('/admin/team', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      toast.success('Equipo creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el equipo');
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateTeamRequest) => {
      return await httpClient.put<AdminTeam>(`/admin/team/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      toast.success('Equipo actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el equipo');
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await httpClient.delete(`/admin/team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      toast.success('Equipo eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el equipo');
    },
  });
}

// Players Hooks
export function useAdminPlayers(filters: PlayerFilters = {}) {
  return useQuery({
    queryKey: adminQueryKeys.players(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.size) params.set('size', filters.size.toString());
      if (filters.search) params.set('q', filters.search);
      if (filters.teamId) params.set('team', filters.teamId.toString());
      if (filters.region) params.set('region', filters.region);
      if (filters.role) params.set('role', filters.role);
      if (filters.status) params.set('status', filters.status);

      const query = params.toString();
      const path = `/players${query ? `?${query}` : ''}`;
      
      return await httpClient.get<AdminPaginatedResponse<AdminPlayer>>(path);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePlayerRequest) => {
      return await httpClient.post<AdminPlayer>('/admin/player', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] });
      // Also invalidate public players list
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Jugador creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el jugador');
    },
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdatePlayerRequest) => {
      return await httpClient.put<AdminPlayer>(`/admin/player/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Jugador actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el jugador');
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await httpClient.delete(`/admin/player/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Jugador eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el jugador');
    },
  });
}

// Matches Hooks
export function useAdminMatches(filters: MatchFilters = {}) {
  return useQuery({
    queryKey: adminQueryKeys.matches(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.scope) params.set('scope', filters.scope);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.size) params.set('size', filters.size.toString());
      if (filters.search) params.set('q', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.tournamentId) params.set('tournamentId', filters.tournamentId.toString());

      const query = params.toString();
      const path = `/matches${query ? `?${query}` : ''}`;
      
      return await httpClient.get<AdminPaginatedResponse<AdminMatch>>(path);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateMatchRequest) => {
      return await httpClient.post<AdminMatch>('/admin/match', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'matches'] });
      // Also invalidate public matches
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Partido creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el partido');
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateMatchRequest) => {
      return await httpClient.put<AdminMatch>(`/admin/match/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Partido actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el partido');
    },
  });
}

export function useCloseMatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CloseMatchRequest) => {
      return await httpClient.post('/admin/match-result', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      // Invalidate leaderboard as points may have changed
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['fantasy'] });
      toast.success('Partido finalizado y puntos recalculados');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al finalizar el partido');
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await httpClient.delete(`/admin/match/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Partido eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el partido');
    },
  });
}

// Recalculate Hook
export function useRecalculatePoints() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await httpClient.post<RecalculateResponse>('/admin/recalculate');
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['fantasy'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] });
      
      toast.success(`Recálculo completado: ${data.affectedPlayers} jugadores y ${data.affectedMatches} partidos actualizados`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error en el recálculo de puntos');
    },
  });
}