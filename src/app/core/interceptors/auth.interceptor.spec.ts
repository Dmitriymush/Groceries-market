import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@core/auth/auth.service';
import { signal } from '@angular/core';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token: signal('mock-token-123') } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should add Authorization header when token exists', () => {
    http.get('http://localhost:3001/groceries').subscribe();
    const req = httpTesting.expectOne('http://localhost:3001/groceries');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token-123');
    req.flush([]);
  });
});
