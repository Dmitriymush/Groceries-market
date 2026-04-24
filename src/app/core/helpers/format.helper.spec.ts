import { describe, it, expect } from 'vitest';
import { FormatHelper } from './format.helper';

describe('FormatHelper', () => {
  describe('formatAmount', () => {
    it('should format pcs', () => {
      expect(FormatHelper.formatAmount(3, 'pcs')).toBe('3 pcs');
    });

    it('should format kg with decimal', () => {
      expect(FormatHelper.formatAmount(1.5, 'kg')).toBe('1.5 kg');
    });

    it('should format liters', () => {
      expect(FormatHelper.formatAmount(2, 'liters')).toBe('2 liters');
    });

    it('should format packs', () => {
      expect(FormatHelper.formatAmount(1, 'packs')).toBe('1 packs');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string', () => {
      const result = FormatHelper.formatDate('2026-04-23T10:00:00Z');
      expect(result).toContain('2026');
    });
  });
});
