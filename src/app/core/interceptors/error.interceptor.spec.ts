import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let mockNotification: { showError: ReturnType<typeof vi.fn> };
  let mockAuth: { logout: ReturnType<typeof vi.fn>; token: ReturnType<typeof signal> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockNotification = { showError: vi.fn() };
    mockAuth = { logout: vi.fn(), token: signal('token') };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: mockNotification },
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should call logout and navigate to /login on 401', () => {
    http.get('http://localhost:3001/groceries').subscribe({ error: () => {} });
    httpTesting.expectOne('http://localhost:3001/groceries').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(mockAuth.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show error notification on 500', () => {
    http.get('http://localhost:3001/groceries').subscribe({ error: () => {} });
    httpTesting.expectOne('http://localhost:3001/groceries').flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    expect(mockNotification.showError).toHaveBeenCalled();
  });
});
