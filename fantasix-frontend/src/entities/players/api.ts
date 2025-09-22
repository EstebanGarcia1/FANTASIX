import httpClient from '../../shared/api/http';
import type {
  PlayerDetailed,
  PlayersResponse,
  PlayerFilters,
  NextMatch,
  PlayerApiResponse,
  PlayersApiResponse,
  NextMatchApiResponse,
} from './types';

/**
 * Transforms API player response to internal format
 */
function transformPlayer(apiPlayer: PlayerApiResponse): PlayerDetailed {
  return {
    id: apiPlayer.id,
    nickname: apiPlayer.nickname,
    realName: apiPlayer.realName,
    role: apiPlayer.role as 'Entry' | 'Flex' | 'Support',
    imageUrl: apiPlayer.imageUrl,
    region: apiPlayer.region,
    teamId: apiPlayer.teamId,
    Team: {
      id: apiPlayer.Team.id,
      name: apiPlayer.Team.name,
      logoUrl: apiPlayer.Team.logoUrl,
      region: apiPlayer.Team.region,
    },
    stats: {
      totalPoints: apiPlayer.stats.totalPoints,
      gamesPlayed: apiPlayer.stats.gamesPlayed,
      averagePointsPerGame: apiPlayer.stats.averagePointsPerGame,
      currentPhasePoints: apiPlayer.stats.currentPhasePoints,
      groupPhasePoints: apiPlayer.stats.groupPhasePoints,
      playoffsPoints: apiPlayer.stats.playoffsPoints,
      pointsByRival: apiPlayer.stats.pointsByRival.map(rival => ({
        rivalTeam: {
          id: rival.rivalTeam.id,
          name: rival.rivalTeam.name,
          logoUrl: rival.rivalTeam.logoUrl,
          region: rival.rivalTeam.region,
        },
        points: rival.points,
        date: rival.date,
        matchId: rival.matchId,
      })),
    },
    isActive: apiPlayer.isActive,
    joinedAt: apiPlayer.joinedAt,
    socialLinks: apiPlayer.socialLinks,
  };
}

/**
 * Fetches players list with filters and pagination
 */
export async function fetchPlayers(filters: PlayerFilters = {}): Promise<PlayersResponse> {
  const params = new URLSearchParams();
  
  if (filters.role) params.append('role', filters.role);
  if (filters.teamId) params.append('teamId', filters.teamId.toString());
  if (filters.region) params.append('region', filters.region);
  if (filters.search?.trim()) params.append('q', filters.search.trim());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const query = params.toString();
  const endpoint = `/players${query ? `?${query}` : ''}`;

  try {
    const response = await httpClient.get<PlayersApiResponse>(endpoint, false);
    
    const totalPages = Math.ceil(response.total / response.limit);
    
    return {
      players: response.players.map(transformPlayer),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages,
      hasMore: response.page < totalPages,
    };
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
}

/**
 * Fetches a single player by ID with detailed stats
 */
export async function fetchPlayerById(id: number): Promise<PlayerDetailed> {
  try {
    const response = await httpClient.get<PlayerApiResponse>(`/players/${id}`, false);
    return transformPlayer(response);
  } catch (error) {
    console.error(`Error fetching player ${id}:`, error);
    throw error;
  }
}

/**
 * Fetches next match for a player
 */
export async function fetchPlayerNextMatch(playerId: number): Promise<NextMatch | null> {
  try {
    const response = await httpClient.get<{ matches: NextMatchApiResponse[] }>(
      `/matches?playerId=${playerId}&scope=upcoming&limit=1`,
      false
    );

    if (response.matches.length === 0) {
      return null;
    }

    const match = response.matches[0];
    
    // Determine which team is the rival and if player's team is home
    const playerResponse = await httpClient.get<PlayerApiResponse>(`/players/${playerId}`, false);
    const playerTeamId = playerResponse.teamId;
    
    const isHome = match.teamA.id === playerTeamId;
    const rivalTeam = isHome ? match.teamB : match.teamA;

    return {
      id: match.id,
      date: match.date,
      rivalTeam: {
        id: rivalTeam.id,
        name: rivalTeam.name,
        logoUrl: rivalTeam.logoUrl,
        region: '', // Not provided in match response
      },
      tournament: match.tournament,
      round: match.round,
      format: match.format,
      isHome,
    };
  } catch (error) {
    console.error(`Error fetching next match for player ${playerId}:`, error);
    return null;
  }
}

/**
 * Validates player filters
 */
export function validatePlayerFilters(filters: Partial<PlayerFilters>): PlayerFilters {
  return {
    role: filters.role === 'Entry' || filters.role === 'Flex' || filters.role === 'Support' 
      ? filters.role 
      : undefined,
    teamId: filters.teamId && filters.teamId > 0 ? filters.teamId : undefined,
    region: filters.region?.trim() || undefined,
    search: filters.search?.trim() || undefined,
    page: Math.max(1, parseInt(String(filters.page || 1), 10) || 1),
    limit: Math.min(100, Math.max(10, parseInt(String(filters.limit || 20), 10) || 20)),
    sortBy: filters.sortBy === 'points' || filters.sortBy === 'name' || filters.sortBy === 'team' 
      ? filters.sortBy 
      : 'points',
    sortOrder: filters.sortOrder === 'asc' || filters.sortOrder === 'desc' 
      ? filters.sortOrder 
      : 'desc',
  };
}

/**
 * Mock data for development when backend is not available
 */
export function getMockPlayers(): PlayerDetailed[] {
  return [
    {
      id: 1,
      nickname: 'Shaiiko',
      realName: 'Stephane Lebleu',
      role: 'Entry',
      imageUrl: undefined,
      region: 'EU',
      teamId: 1,
      Team: {
        id: 1,
        name: 'G2 Esports',
        logoUrl: 'https://example.com/g2-logo.png',
        region: 'EU',
      },
      stats: {
        totalPoints: 1450,
        gamesPlayed: 24,
        averagePointsPerGame: 60.4,
        currentPhasePoints: 580,
        groupPhasePoints: 870,
        playoffsPoints: 580,
        pointsByRival: [
          {
            rivalTeam: { id: 2, name: 'BDS', logoUrl: '', region: 'EU' },
            points: 85,
            date: '2024-12-01',
            matchId: 101,
          },
          {
            rivalTeam: { id: 3, name: 'Wolves', logoUrl: '', region: 'EU' },
            points: 72,
            date: '2024-11-28',
            matchId: 102,
          },
        ],
      },
      isActive: true,
      joinedAt: '2023-01-15',
      socialLinks: {
        twitter: 'https://twitter.com/G2Shaiiko',
        twitch: 'https://twitch.tv/shaiiko',
      },
    },
    {
      id: 2,
      nickname: 'CTZN',
      realName: 'Carl Layton',
      role: 'Flex',
      imageUrl: undefined,
      region: 'EU',
      teamId: 1,
      Team: {
        id: 1,
        name: 'G2 Esports',
        logoUrl: 'https://example.com/g2-logo.png',
        region: 'EU',
      },
      stats: {
        totalPoints: 1320,
        gamesPlayed: 24,
        averagePointsPerGame: 55.0,
        currentPhasePoints: 520,
        groupPhasePoints: 800,
        playoffsPoints: 520,
        pointsByRival: [
          {
            rivalTeam: { id: 2, name: 'BDS', logoUrl: '', region: 'EU' },
            points: 68,
            date: '2024-12-01',
            matchId: 101,
          },
        ],
      },
      isActive: true,
      joinedAt: '2023-01-15',
      socialLinks: {
        twitter: 'https://twitter.com/G2CTZN',
      },
    },
    {
      id: 3,
      nickname: 'Doki',
      realName: 'Dorian Doki',
      role: 'Support',
      imageUrl: undefined,
      region: 'EU',
      teamId: 3,
      Team: {
        id: 3,
        name: 'Wolves',
        logoUrl: 'https://example.com/wolves-logo.png',
        region: 'EU',
      },
      stats: {
        totalPoints: 1180,
        gamesPlayed: 22,
        averagePointsPerGame: 53.6,
        currentPhasePoints: 450,
        groupPhasePoints: 730,
        playoffsPoints: 450,
        pointsByRival: [],
      },
      isActive: true,
      joinedAt: '2023-02-01',
    },
  ];
}