import { describe, it, expect } from 'vitest';
import { AuthHelper } from './auth.helper';

describe('AuthHelper', () => {
  describe('getStorageKey', () => {
    it('should return the storage key', () => {
      expect(AuthHelper.getStorageKey()).toBe('grocery_auth');
    });
  });

  describe('isTokenValid', () => {
    it('should return false for empty token', () => {
      expect(AuthHelper.isTokenValid('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(AuthHelper.isTokenValid(null as unknown as string)).toBe(false);
    });

    it('should return true for non-empty token', () => {
      expect(AuthHelper.isTokenValid('mock-token-123')).toBe(true);
    });
  });
});
