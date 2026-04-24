import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AuthApi } from '@core/api/auth.api';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let mockAuthApi: { login: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    mockAuthApi = { login: vi.fn() };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApi, useValue: mockAuthApi },
        { provide: Router, useValue: mockRouter },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should set authenticated after successful login', () => {
    const mockUser = { id: 1, username: 'demo', name: 'Demo User', token: 'tok' };
    mockAuthApi.login.mockReturnValue(of(mockUser));
    service.login({ username: 'demo', password: 'demo123' }).subscribe();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(mockUser);
    expect(service.token()).toBe('tok');
  });

  it('should clear state on logout', () => {
    const mockUser = { id: 1, username: 'demo', name: 'Demo User', token: 'tok' };
    mockAuthApi.login.mockReturnValue(of(mockUser));
    service.login({ username: 'demo', password: 'demo123' }).subscribe();
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.token()).toBe('');
  });
});
