import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'grocery_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(this.getInitialMode());

  readonly mode = this._mode.asReadonly();
  readonly isDark = () => this._mode() === 'dark';

  constructor() {
    this.applyMode(this._mode());
  }

  toggle(): void {
    const next = this._mode() === 'dark' ? 'light' : 'dark';
    this._mode.set(next);
    this.applyMode(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  private getInitialMode(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  private applyMode(mode: ThemeMode): void {
    const html = document.documentElement;
    if (mode === 'dark') {
      html.classList.add('app-dark');
    } else {
      html.classList.remove('app-dark');
    }
  }
}
