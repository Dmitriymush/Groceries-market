import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OfflineStoreService } from './offline-store.service';
import { GroceryItem } from '@core/models/grocery.model';

describe('OfflineStoreService', () => {
  let service: OfflineStoreService;

  const mockItems: GroceryItem[] = [
    { id: 1, name: 'Apples', amount: 3, unit: 'pcs', bought: false, userId: 1, createdAt: '2026-04-23T10:00:00Z' },
    { id: 2, name: 'Milk', amount: 2, unit: 'liters', bought: true, userId: 1, createdAt: '2026-04-23T10:01:00Z' },
  ];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [OfflineStoreService],
    });
    service = TestBed.inject(OfflineStoreService);
    await service.saveItems([]);
  });

  it('should return empty array when no items stored', async () => {
    const items = await service.getItems();
    expect(items).toEqual([]);
  });

  it('should save and retrieve items', async () => {
    await service.saveItems(mockItems);
    const items = await service.getItems();
    expect(items.length).toBe(2);
    expect(items[0].name).toBe('Apples');
  });

  it('should enqueue and drain sync entries', async () => {
    await service.enqueue({
      method: 'POST',
      url: '/groceries',
      body: { name: 'Bread' },
      createdAt: new Date().toISOString(),
    });
    await service.enqueue({
      method: 'DELETE',
      url: '/groceries/1',
      body: null,
      createdAt: new Date().toISOString(),
    });

    const size = await service.getQueueSize();
    expect(size).toBe(2);

    const entries = await service.drainQueue();
    expect(entries.length).toBe(2);
    expect(entries[0].method).toBe('POST');
    expect(entries[1].method).toBe('DELETE');

    const afterDrain = await service.getQueueSize();
    expect(afterDrain).toBe(0);
  });
});
