import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthApi } from './auth.api';

describe('AuthApi', () => {
  let api: AuthApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthApi,
      ],
    });
    api = TestBed.inject(AuthApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should GET users with username query', () => {
    api.login({ username: 'demo', password: 'demo123' }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('/users') && r.params.get('username') === 'demo');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, username: 'demo', password: 'demo123', name: 'Demo User', token: 'tok' }]);
  });
});
