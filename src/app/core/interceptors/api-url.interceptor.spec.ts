import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { apiUrlInterceptor } from './api-url.interceptor';

describe('apiUrlInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should prepend apiUrl to relative paths', () => {
    http.get('/groceries').subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('groceries'));
    expect(req.request.url).toContain('groceries');
    req.flush([]);
  });

  it('should not modify absolute URLs', () => {
    http.get('https://external.com/data').subscribe();
    const req = httpTesting.expectOne('https://external.com/data');
    expect(req.request.url).toBe('https://external.com/data');
    req.flush([]);
  });
});
