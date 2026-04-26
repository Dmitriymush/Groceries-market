import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ConnectivityService } from './connectivity.service';

describe('ConnectivityService', () => {
  let service: ConnectivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectivityService],
    });
    service = TestBed.inject(ConnectivityService);
  });

  it('should reflect initial navigator.onLine state', () => {
    expect(service.isOnline()).toBe(navigator.onLine);
  });

  it('should update to offline when offline event fires', () => {
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);
  });

  it('should update to online when online event fires', () => {
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);

    window.dispatchEvent(new Event('online'));
    expect(service.isOnline()).toBe(true);
  });
});
