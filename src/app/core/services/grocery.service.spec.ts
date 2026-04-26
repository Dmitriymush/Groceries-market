import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GroceryService } from './grocery.service';
import { GroceryApi } from '@core/api/grocery.api';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from './notification.service';
import { GroceryWebSocketService } from './grocery-websocket.service';
import { ConnectivityService } from './connectivity.service';
import { OfflineStoreService } from './offline-store.service';
import { of, EMPTY } from 'rxjs';
import { signal } from '@angular/core';
import { GroceryItem } from '@core/models/grocery.model';

describe('GroceryService', () => {
  let service: GroceryService;
  let mockApi: { getAll: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let mockNotification: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn>; showInfo: ReturnType<typeof vi.fn> };

  const mockItems: GroceryItem[] = [
    { id: 1, name: 'Apples', amount: 3, unit: 'pcs', bought: false, userId: 1, createdAt: '2026-04-23T10:00:00Z' },
    { id: 2, name: 'Milk', amount: 2, unit: 'liters', bought: false, userId: 1, createdAt: '2026-04-23T10:01:00Z' },
  ];

  beforeEach(() => {
    mockApi = {
      getAll: vi.fn().mockReturnValue(of(mockItems)),
      create: vi.fn().mockReturnValue(of({ ...mockItems[0], id: 3, name: 'Bread' })),
      update: vi.fn().mockReturnValue(of({ ...mockItems[0], bought: true })),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    mockNotification = { showSuccess: vi.fn(), showError: vi.fn(), showInfo: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        GroceryService,
        { provide: GroceryApi, useValue: mockApi },
        { provide: AuthService, useValue: { currentUser: signal({ id: 1 }) } },
        { provide: NotificationService, useValue: mockNotification },
        { provide: GroceryWebSocketService, useValue: { events$: EMPTY, connectionStatus: signal('disconnected') } },
        { provide: ConnectivityService, useValue: { isOnline: signal(true) } },
        { provide: OfflineStoreService, useValue: { saveItems: vi.fn().mockResolvedValue(undefined), getItems: vi.fn().mockResolvedValue([]), enqueue: vi.fn().mockResolvedValue(undefined) } },
      ],
    });
    service = TestBed.inject(GroceryService);
  });

  it('should load items and set signal', () => {
    service.loadItems();
    expect(service.items().length).toBe(2);
    expect(service.loading()).toBe(false);
  });

  it('should expose vm with computed values', () => {
    service.loadItems();
    const vm = service.vm();
    expect(vm.totalItems).toBe(2);
    expect(vm.hasItems).toBe(true);
    expect(vm.boughtCount).toBe(0);
    expect(vm.remainingCount).toBe(2);
    expect(vm.items[0].name).toBe('Apples');
  });

  it('should add item and refresh list', () => {
    service.addItem({ name: 'Bread', amount: 1, unit: 'pcs' });
    expect(mockApi.create).toHaveBeenCalled();
    expect(mockNotification.showSuccess).toHaveBeenCalled();
  });

  it('should update item', () => {
    service.updateItem(1, { name: 'Green Apples' });
    expect(mockApi.update).toHaveBeenCalledWith(1, { name: 'Green Apples' });
  });

  it('should toggle bought status', () => {
    service.loadItems();
    service.toggleBought(mockItems[0]);
    expect(mockApi.update).toHaveBeenCalledWith(1, { bought: true });
  });

  it('should delete item', () => {
    service.deleteItem(1);
    expect(mockApi.delete).toHaveBeenCalledWith(1);
    expect(mockNotification.showSuccess).toHaveBeenCalled();
  });
});
