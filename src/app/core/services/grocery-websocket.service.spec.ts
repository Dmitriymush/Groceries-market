import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GroceryWebSocketService } from './grocery-websocket.service';
import { WsGroceryEvent } from '@core/models/websocket.model';

describe('GroceryWebSocketService', () => {
  let service: GroceryWebSocketService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [GroceryWebSocketService],
    });
    service = TestBed.inject(GroceryWebSocketService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    vi.useRealTimers();
  });

  it('should start with disconnected status', () => {
    expect(service.connectionStatus()).toBe('disconnected');
  });

  it('should transition to reconnecting then connected', () => {
    service.connect();
    expect(service.connectionStatus()).toBe('reconnecting');

    vi.advanceTimersByTime(1_500);
    expect(service.connectionStatus()).toBe('connected');
  });

  it('should not reconnect if already connected', () => {
    service.connect();
    vi.advanceTimersByTime(1_500);
    expect(service.connectionStatus()).toBe('connected');

    service.connect();
    expect(service.connectionStatus()).toBe('connected');
  });

  it('should disconnect and set status', () => {
    service.connect();
    vi.advanceTimersByTime(1_500);
    expect(service.connectionStatus()).toBe('connected');

    service.disconnect();
    expect(service.connectionStatus()).toBe('disconnected');
  });

  it('should emit events after connection', () => {
    const events: WsGroceryEvent[] = [];
    service.events$.subscribe((e) => events.push(e));

    service.connect();
    vi.advanceTimersByTime(1_500);
    expect(events.length).toBe(0);

    vi.advanceTimersByTime(20_000);
    expect(events.length).toBe(1);
    expect(events[0].type).toBeDefined();
    expect(events[0].payload.itemName).toBeDefined();
    expect(events[0].payload.username).toBeDefined();
    expect(events[0].timestamp).toBeDefined();
  });

  it('should stop emitting events after disconnect', () => {
    const events: WsGroceryEvent[] = [];
    service.events$.subscribe((e) => events.push(e));

    service.connect();
    vi.advanceTimersByTime(1_500);
    vi.advanceTimersByTime(20_000);
    expect(events.length).toBe(1);

    service.disconnect();
    vi.advanceTimersByTime(20_000);
    expect(events.length).toBe(1);
  });

  it('should generate valid event types', () => {
    const validTypes = ['item_added', 'item_updated', 'item_deleted', 'item_toggled'];
    const events: WsGroceryEvent[] = [];
    service.events$.subscribe((e) => events.push(e));

    service.connect();
    vi.advanceTimersByTime(1_500);

    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(20_000);
    }

    events.forEach((e) => {
      expect(validTypes).toContain(e.type);
      expect(e.payload.itemId).toBeGreaterThan(0);
    });
  });
});
