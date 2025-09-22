// src/features/matches/components/__tests__/MatchCard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchCard } from '../MatchCard';
import type { Match } from '../../../../entities/matches/types';

// Mock utilities
vi.mock('../utils/matchTime', () => ({
  formatMatchTime: vi.fn(() => ({
    formatted: 'Lun 15 Ene 20:00',
    relative: 'En 2h',
    countdown: { days: 0, hours: 2, minutes: 15, seconds: 30, isLive: false },
  })),
  getMatchStatusColor: vi.fn(() => 'text-blue-600 bg-blue-50'),
  getMatchStatusText: vi.fn(() => 'Programado'),
  shouldShowCountdown: vi.fn(() => true),
}));

const mockMatch: Match = {
  id: 1,
  date: '2024-01-15T20:00:00Z',
  format: 'BO3',
  round: 'Cuartos de Final',
  phase: 'Playoffs',
  status: 'scheduled',
  scoreA: 0,
  scoreB: 0,
  mapScores: [],
  teamA: {
    id: 1,
    name: 'G2 Esports',
    logoUrl: 'https://example.com/g2.png',
  },
  teamB: {
    id: 2,
    name: 'Team BDS',
    logoUrl: 'https://example.com/bds.png',
  },
  tournament: {
    id: 1,
    name: 'EUL Stage 1',
    startDate: '2024-01-01',
    isActive: true,
  },
  externalUrl: 'https://siege.gg/matches/123',
};

describe('MatchCard', () => {
  it('renders scheduled match correctly', () => {
    render(<MatchCard match={mockMatch} />);

    expect(screen.getByText('G2 Esports')).toBeInTheDocument();
    expect(screen.getByText('Team BDS')).toBeInTheDocument();
    expect(screen.getByText('BO3')).toBeInTheDocument();
    expect(screen.getByText('Cuartos de Final')).toBeInTheDocument();
    expect(screen.getByText('Programado')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('renders finished match with scores', () => {
    const finishedMatch: Match = {
      ...mockMatch,
      status: 'finished',
      scoreA: 2,
      scoreB: 1,
      mapScores: ['7-5', '6-8', '7-3'],
    };

    render(<MatchCard match={finishedMatch} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Mapas:')).toBeInTheDocument();
    expect(screen.getByText('7-5')).toBeInTheDocument();
    expect(screen.getByText('6-8')).toBeInTheDocument();
    expect(screen.getByText('7-3')).toBeInTheDocument();
  });

  it('shows highlight when user has players', () => {
    const highlight = {
      hasPlayers: true,
      teamNames: ['G2 Esports'],
      playerCount: 2,
    };

    render(<MatchCard match={mockMatch} highlight={highlight} />);

    expect(screen.getByText('👥 Tengo jugadores')).toBeInTheDocument();
  });

  it('shows external link when available', () => {
    render(<MatchCard match={mockMatch} />);

    const externalLink = screen.getByText('Ver detalles ↗');
    expect(externalLink).toBeInTheDocument();
    expect(externalLink.closest('a')).toHaveAttribute('href', 'https://siege.gg/matches/123');
    expect(externalLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('shows countdown for upcoming matches', () => {
    render(<MatchCard match={mockMatch} showCountdown={true} />);

    // The countdown component should be rendered
    // (specific countdown text depends on the mocked formatMatchTime)
    expect(screen.getByText('Lun 15 Ene 20:00')).toBeInTheDocument();
    expect(screen.getByText('En 2h')).toBeInTheDocument();
  });

  it('does not show countdown when disabled', () => {
    render(<MatchCard match={mockMatch} showCountdown={false} />);

    // Should still show formatted time but not countdown
    expect(screen.getByText('Lun 15 Ene 20:00')).toBeInTheDocument();
  });
});

// src/features/matches/utils/__tests__/matchTime.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatMatchTime, getMatchStatusColor, getMatchStatusText, shouldShowCountdown } from '../matchTime';

describe('matchTime utilities', () => {
  beforeEach(() => {
    // Mock current time to 2024-01-15T18:00:00Z
    vi.setSystemTime(new Date('2024-01-15T18:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatMatchTime', () => {
    it('formats future match time correctly', () => {
      const future = '2024-01-15T20:00:00Z'; // 2 hours from now
      const result = formatMatchTime(future);

      expect(result.relative).toBe('En 2h');
      expect(result.countdown).toBeDefined();
      expect(result.countdown?.hours).toBe(2);
      expect(result.countdown?.isLive).toBe(false);
    });

    it('formats past match time correctly', () => {
      const past = '2024-01-15T16:00:00Z'; // 2 hours ago
      const result = formatMatchTime(past);

      expect(result.relative).toBe('Hace 2h');
      expect(result.countdown).toBeUndefined();
    });

    it('shows minutes for very recent matches', () => {
      const recent = '2024-01-15T18:30:00Z'; // 30 minutes from now
      const result = formatMatchTime(recent);

      expect(result.relative).toBe('En 30 min');
      expect(result.countdown?.minutes).toBe(30);
    });

    it('identifies live matches', () => {
      const justStarted = '2024-01-15T17:45:00Z'; // 15 minutes ago (within live window)
      const result = formatMatchTime(justStarted);

      expect(result.countdown?.isLive).toBe(true);
    });
  });

  describe('getMatchStatusColor', () => {
    it('returns correct colors for each status', () => {
      expect(getMatchStatusColor('scheduled')).toContain('text-blue-600');
      expect(getMatchStatusColor('in_progress')).toContain('text-red-600');
      expect(getMatchStatusColor('finished')).toContain('text-green-600');
      expect(getMatchStatusColor('cancelled')).toContain('text-gray-600');
    });
  });

  describe('getMatchStatusText', () => {
    it('returns correct Spanish text for each status', () => {
      expect(getMatchStatusText('scheduled')).toBe('Programado');
      expect(getMatchStatusText('in_progress')).toBe('En vivo');
      expect(getMatchStatusText('finished')).toBe('Finalizado');
      expect(getMatchStatusText('cancelled')).toBe('Cancelado');
    });
  });

  describe('shouldShowCountdown', () => {
    it('shows countdown for matches within 48 hours', () => {
      const within48h = '2024-01-16T18:00:00Z'; // 24 hours from now
      expect(shouldShowCountdown(within48h)).toBe(true);
    });

    it('does not show countdown for matches beyond 48 hours', () => {
      const beyond48h = '2024-01-18T18:00:00Z'; // 72 hours from now
      expect(shouldShowCountdown(beyond48h)).toBe(false);
    });

    it('does not show countdown for past matches', () => {
      const past = '2024-01-14T18:00:00Z'; // 24 hours ago
      expect(shouldShowCountdown(past)).toBe(false);
    });
  });
});