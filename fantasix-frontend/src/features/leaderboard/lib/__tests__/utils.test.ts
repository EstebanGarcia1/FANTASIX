import { describe, it, expect } from '@jest/globals';
import {
  calculatePageForPosition,
  calculatePageRange,
  isPositionInPage,
  formatPosition,
  generatePageNumbers,
  validateLeaderboardFilters
} from '../utils';

describe('Leaderboard Utils', () => {
  describe('calculatePageForPosition', () => {
    it('should calculate correct page for position 1', () => {
      expect(calculatePageForPosition(1, 50)).toBe(1);
    });

    it('should calculate correct page for position 50', () => {
      expect(calculatePageForPosition(50, 50)).toBe(1);
    });

    it('should calculate correct page for position 51', () => {
      expect(calculatePageForPosition(51, 50)).toBe(2);
    });

    it('should calculate correct page for position 127', () => {
      expect(calculatePageForPosition(127, 50)).toBe(3);
    });

    it('should handle edge cases', () => {
      expect(calculatePageForPosition(1, 1)).toBe(1);
      expect(calculatePageForPosition(100, 25)).toBe(4);
      expect(calculatePageForPosition(101, 25)).toBe(5);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculatePageForPosition(0, 50)).toThrow();
      expect(() => calculatePageForPosition(1, 0)).toThrow();
      expect(() => calculatePageForPosition(-1, 50)).toThrow();
    });
  });

  describe('calculatePageRange', () => {
    it('should calculate correct range for page 1', () => {
      const range = calculatePageRange(1, 50);
      expect(range.startPosition).toBe(1);
      expect(range.endPosition).toBe(50);
    });

    it('should calculate correct range for page 2', () => {
      const range = calculatePageRange(2, 50);
      expect(range.startPosition).toBe(51);
      expect(range.endPosition).toBe(100);
    });

    it('should calculate correct range for page 3', () => {
      const range = calculatePageRange(3, 25);
      expect(range.startPosition).toBe(51);
      expect(range.endPosition).toBe(75);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculatePageRange(0, 50)).toThrow();
      expect(() => calculatePageRange(1, 0)).toThrow();
    });
  });

  describe('isPositionInPage', () => {
    it('should return true for positions in page 1', () => {
      expect(isPositionInPage(1, 1, 50)).toBe(true);
      expect(isPositionInPage(25, 1, 50)).toBe(true);
      expect(isPositionInPage(50, 1, 50)).toBe(true);
    });

    it('should return false for positions outside page 1', () => {
      expect(isPositionInPage(51, 1, 50)).toBe(false);
      expect(isPositionInPage(100, 1, 50)).toBe(false);
    });

    it('should work correctly for different page sizes', () => {
      expect(isPositionInPage(127, 3, 50)).toBe(true); // Page 3: positions 101-150
      expect(isPositionInPage(100, 3, 50)).toBe(false);
      expect(isPositionInPage(151, 3, 50)).toBe(false);
    });
  });

  describe('formatPosition', () => {
    it('should return regular position when no ties', () => {
      const allRows = [
        { position: 1, pointsTotal: 1000 },
        { position: 2, pointsTotal: 900 },
        { position: 3, pointsTotal: 800 },
      ];

      expect(formatPosition(1, 1000, allRows)).toBe('1');
      expect(formatPosition(2, 900, allRows)).toBe('2');
      expect(formatPosition(3, 800, allRows)).toBe('3');
    });

    it('should return "=" prefix for tied positions', () => {
      const allRows = [
        { position: 1, pointsTotal: 1000 },
        { position: 2, pointsTotal: 900 },
        { position: 3, pointsTotal: 900 }, // Tied with position 2
        { position: 4, pointsTotal: 800 },
      ];

      expect(formatPosition(1, 1000, allRows)).toBe('1');
      expect(formatPosition(2, 900, allRows)).toBe('2'); // First with this score
      expect(formatPosition(3, 900, allRows)).toBe('=2'); // Tied, show =2
      expect(formatPosition(4, 800, allRows)).toBe('4');
    });

    it('should handle multiple ties correctly', () => {
      const allRows = [
        { position: 1, pointsTotal: 1000 },
        { position: 2, pointsTotal: 900 },
        { position: 3, pointsTotal: 900 },
        { position: 4, pointsTotal: 900 }, // Three-way tie
        { position: 5, pointsTotal: 800 },
      ];

      expect(formatPosition(2, 900, allRows)).toBe('2');
      expect(formatPosition(3, 900, allRows)).toBe('=2');
      expect(formatPosition(4, 900, allRows)).toBe('=2');
      expect(formatPosition(5, 800, allRows)).toBe('5');
    });
  });

  describe('generatePageNumbers', () => {
    it('should return all pages when total <= maxVisible', () => {
      expect(generatePageNumbers(2, 3, 5)).toEqual([1, 2, 3]);
      expect(generatePageNumbers(1, 5, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should center around current page when possible', () => {
      expect(generatePageNumbers(5, 10, 5)).toEqual([3, 4, 5, 6, 7]);
      expect(generatePageNumbers(6, 10, 5)).toEqual([4, 5, 6, 7, 8]);
    });

    it('should adjust when near the beginning', () => {
      expect(generatePageNumbers(1, 10, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(generatePageNumbers(2, 10, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should adjust when near the end', () => {
      expect(generatePageNumbers(9, 10, 5)).toEqual([6, 7, 8, 9, 10]);
      expect(generatePageNumbers(10, 10, 5)).toEqual([6, 7, 8, 9, 10]);
    });
  });

  describe('validateLeaderboardFilters', () => {
    it('should validate and sanitize filters correctly', () => {
      const result = validateLeaderboardFilters({
        phase: 'group',
        page: '2',
        size: '25',
        search: '  test query  '
      });

      expect(result).toEqual({
        phase: 'group',
        page: 2,
        size: 25,
        search: 'test query'
      });
    });

    it('should handle invalid phase', () => {
      const result = validateLeaderboardFilters({ phase: 'invalid' });
      expect(result.phase).toBe('group');
    });

    it('should handle invalid page numbers', () => {
      expect(validateLeaderboardFilters({ page: '0' }).page).toBe(1);
      expect(validateLeaderboardFilters({ page: '-5' }).page).toBe(1);
      expect(validateLeaderboardFilters({ page: 'invalid' }).page).toBe(1);
    });

    it('should limit page size', () => {
      expect(validateLeaderboardFilters({ size: '5' }).size).toBe(10); // Minimum
      expect(validateLeaderboardFilters({ size: '200' }).size).toBe(100); // Maximum
    });

    it('should handle empty search', () => {
      expect(validateLeaderboardFilters({ search: '' }).search).toBeUndefined();
      expect(validateLeaderboardFilters({ search: '   ' }).search).toBeUndefined();
    });

    it('should use defaults for missing values', () => {
      const result = validateLeaderboardFilters({});
      expect(result).toEqual({
        phase: 'group',
        page: 1,
        size: 50,
        search: undefined
      });
    });
  });
});