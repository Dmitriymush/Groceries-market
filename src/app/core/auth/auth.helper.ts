import { StoredAuth } from '@core/models/auth.model';

export abstract class AuthHelper {
  private static readonly STORAGE_KEY = 'grocery_auth';

  static getStorageKey(): string {
    return this.STORAGE_KEY;
  }

  static isTokenValid(token: string): boolean {
    return !!token && token.length > 0;
  }

  static storeAuth(auth: StoredAuth): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(auth));
  }

  static getStoredAuth(): StoredAuth | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  }

  static clearAuth(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
