// src/features/matches/hooks/useUserHighlight.ts

import { useMemo } from 'react';
import { useMyFantasyTeam } from '../../../shared/api/hooks';
import type { Match, UserTeamHighlight } from '../../../entities/matches/types';
import type { FantasyPhase } from '../../../entities/types';

/**
 * Hook to determine if a match should be highlighted based on user's fantasy team
 */
export function useUserMatchHighlight(
  match: Match, 
  phase: FantasyPhase = 'group'
): UserTeamHighlight {
  const { data: myTeam } = useMyFantasyTeam(phase);

  return useMemo(() => {
    if (!myTeam?.picks) {
      return {
        hasPlayers: false,
        teamNames: [],
        playerCount: 0,
      };
    }

    // Get team IDs from user's fantasy team
    const userTeamIds = new Set(
      myTeam.picks
        .map(pick => pick.player.Team?.id)
        .filter(Boolean)
    );

    // Check if any of the match teams have user's players
    const matchTeamIds = [match.teamA.id, match.teamB.id];
    const relevantTeams = matchTeamIds.filter(teamId => userTeamIds.has(teamId));
    
    if (relevantTeams.length === 0) {
      return {
        hasPlayers: false,
        teamNames: [],
        playerCount: 0,
      };
    }

    // Get team names and player count
    const teamNames: string[] = [];
    let playerCount = 0;

    if (relevantTeams.includes(match.teamA.id)) {
      teamNames.push(match.teamA.name);
      playerCount += myTeam.picks.filter(
        pick => pick.player.Team?.id === match.teamA.id
      ).length;
    }

    if (relevantTeams.includes(match.teamB.id)) {
      teamNames.push(match.teamB.name);
      playerCount += myTeam.picks.filter(
        pick => pick.player.Team?.id === match.teamB.id
      ).length;
    }

    return {
      hasPlayers: true,
      teamNames,
      playerCount,
    };
  }, [match, myTeam]);
}

/**
 * Hook to get highlights for multiple matches
 */
export function useUserMatchesHighlight(
  matches: Match[], 
  phase: FantasyPhase = 'group'
): Map<number, UserTeamHighlight> {
  const { data: myTeam } = useMyFantasyTeam(phase);

  return useMemo(() => {
    const highlights = new Map<number, UserTeamHighlight>();

    if (!myTeam?.picks) {
      return highlights;
    }

    // Get team IDs from user's fantasy team
    const userTeamIds = new Set(
      myTeam.picks
        .map(pick => pick.player.Team?.id)
        .filter(Boolean)
    );

    matches.forEach(match => {
      const matchTeamIds = [match.teamA.id, match.teamB.id];
      const relevantTeams = matchTeamIds.filter(teamId => userTeamIds.has(teamId));
      
      if (relevantTeams.length === 0) {
        highlights.set(match.id, {
          hasPlayers: false,
          teamNames: [],
          playerCount: 0,
        });
        return;
      }

      // Get team names and player count
      const teamNames: string[] = [];
      let playerCount = 0;

      if (relevantTeams.includes(match.teamA.id)) {
        teamNames.push(match.teamA.name);
        playerCount += myTeam.picks.filter(
          pick => pick.player.Team?.id === match.teamA.id
        ).length;
      }

      if (relevantTeams.includes(match.teamB.id)) {
        teamNames.push(match.teamB.name);
        playerCount += myTeam.picks.filter(
          pick => pick.player.Team?.id === match.teamB.id
        ).length;
      }

      highlights.set(match.id, {
        hasPlayers: true,
        teamNames,
        playerCount,
      });
    });

    return highlights;
  }, [matches, myTeam]);
}