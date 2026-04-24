import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '@core/auth/auth.service';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const createGuardContext = (isAuthenticated: boolean) => {
    mockRouter = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: signal(isAuthenticated) } },
        { provide: Router, useValue: mockRouter },
      ],
    });
  };

  it('should allow access when authenticated', () => {
    createGuardContext(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('should redirect to /login when not authenticated', () => {
    createGuardContext(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
