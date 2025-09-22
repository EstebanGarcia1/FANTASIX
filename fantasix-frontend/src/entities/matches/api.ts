// src/entities/matches/api.ts

import httpClient from '../../shared/api/http';
import type { 
  Match, 
  MatchFilters, 
  MatchesResponse, 
  Bracket 
} from './types';

// API Response adapters
interface BackendMatch {
  id: number;
  scheduledTime: string;
  format: string;
  round: string;
  phase: string;
  status: string;
  scoreTeamA: number;
  scoreTeamB: number;
  mapScores: string;
  teamA: {
    id: number;
    name: string;
    logoUrl?: string;
    region?: string;
  };
  teamB: {
    id: number;
    name: string;
    logoUrl?: string;
    region?: string;
  };
  tournament?: {
    id: number;
    name: string;
    slug?: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
  };
  externalUrl?: string;
  streamUrl?: string;
}

interface BackendMatchesResponse {
  matches: BackendMatch[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// Transform backend data to frontend types
function adaptMatch(backendMatch: BackendMatch): Match {
  return {
    id: backendMatch.id,
    date: backendMatch.scheduledTime,
    format: backendMatch.format as Match['format'],
    round: backendMatch.round,
    phase: backendMatch.phase,
    status: backendMatch.status as Match['status'],
    scoreA: backendMatch.scoreTeamA || 0,
    scoreB: backendMatch.scoreTeamB || 0,
    mapScores: backendMatch.mapScores ? JSON.parse(backendMatch.mapScores) : [],
    teamA: {
      id: backendMatch.teamA.id,
      name: backendMatch.teamA.name,
      logoUrl: backendMatch.teamA.logoUrl,
      region: backendMatch.teamA.region,
    },
    teamB: {
      id: backendMatch.teamB.id,
      name: backendMatch.teamB.name,
      logoUrl: backendMatch.teamB.logoUrl,
      region: backendMatch.teamB.region,
    },
    tournament: backendMatch.tournament,
    externalUrl: backendMatch.externalUrl,
    streamUrl: backendMatch.streamUrl,
  };
}

function adaptMatchesResponse(response: BackendMatchesResponse): MatchesResponse {
  return {
    matches: response.matches.map(adaptMatch),
    page: response.pagination.page,
    size: response.pagination.size,
    total: response.pagination.total,
    hasMore: response.pagination.page < response.pagination.totalPages,
  };
}

// API Functions
export async function fetchMatches(filters: MatchFilters = {}): Promise<MatchesResponse> {
  const params = new URLSearchParams();
  
  if (filters.scope) params.append('scope', filters.scope);
  if (filters.tournamentId) params.append('tournamentId', filters.tournamentId.toString());
  if (filters.teamId) params.append('teamId', filters.teamId.toString());
  if (filters.round) params.append('round', filters.round);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.size) params.append('size', filters.size.toString());

  const query = params.toString();
  const path = `/api/matches${query ? `?${query}` : ''}`;
  
  try {
    const response = await httpClient.get<BackendMatchesResponse>(path, false);
    return adaptMatchesResponse(response);
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    throw error;
  }
}

export async function fetchBracket(tournamentId: number): Promise<Bracket | null> {
  try {
    const response = await httpClient.get<{
      bracket: {
        tournamentId: number;
        rounds: Array<{
          name: string;
          matches: Array<{
            id: number;
            teamA?: { id: number; name: string; logoUrl?: string };
            teamB?: { id: number; name: string; logoUrl?: string };
            scoreA?: number;
            scoreB?: number;
            status: string;
            scheduledTime?: string;
          }>;
        }>;
        lastUpdated: string;
      };
    }>(`/api/bracket/${tournamentId}`, false);

    return {
      tournamentId: response.bracket.tournamentId,
      rounds: response.bracket.rounds.map(round => ({
        name: round.name,
        matches: round.matches.map(match => ({
          id: match.id,
          teamA: match.teamA,
          teamB: match.teamB,
          scoreA: match.scoreA,
          scoreB: match.scoreB,
          status: match.status as Match['status'],
          scheduledTime: match.scheduledTime,
        })),
      })),
      lastUpdated: response.bracket.lastUpdated,
    };
  } catch (error) {
    console.warn('Bracket not available:', error);
    return null;
  }
}