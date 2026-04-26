import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { SyncService } from './sync.service';
import { ConnectivityService } from './connectivity.service';
import { OfflineStoreService, SyncQueueEntry } from './offline-store.service';
import { NotificationService } from './notification.service';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('SyncService', () => {
  let mockHttp: { post: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let mockOfflineStore: { drainQueue: ReturnType<typeof vi.fn>; enqueue: ReturnType<typeof vi.fn> };
  let mockNotification: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn>; showInfo: ReturnType<typeof vi.fn> };
  const isOnline = signal(true);

  const queueEntries: SyncQueueEntry[] = [
    { id: 1, method: 'POST', url: '/groceries', body: { name: 'Bread' }, createdAt: '2026-04-23T10:00:00Z' },
    { id: 2, method: 'DELETE', url: '/groceries/5', body: null, createdAt: '2026-04-23T10:01:00Z' },
  ];

  beforeEach(() => {
    mockHttp = {
      post: vi.fn().mockReturnValue(of({ id: 3, name: 'Bread' })),
      patch: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    mockOfflineStore = {
      drainQueue: vi.fn().mockResolvedValue(queueEntries),
      enqueue: vi.fn().mockResolvedValue(undefined),
    };
    mockNotification = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SyncService,
        { provide: HttpClient, useValue: mockHttp },
        { provide: ConnectivityService, useValue: { isOnline: isOnline.asReadonly() } },
        { provide: OfflineStoreService, useValue: mockOfflineStore },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });
  });

  it('should replay queued entries on processQueue', async () => {
    const service = TestBed.inject(SyncService);
    await service.processQueue();

    expect(mockHttp.post).toHaveBeenCalledWith('/groceries', { name: 'Bread' });
    expect(mockHttp.delete).toHaveBeenCalledWith('/groceries/5');
    expect(mockNotification.showSuccess).toHaveBeenCalledWith('Synced 2 offline changes');
  });

  it('should re-enqueue failed entries', async () => {
    mockHttp.post.mockReturnValue(throwError(() => new Error('Network error')));

    const service = TestBed.inject(SyncService);
    await service.processQueue();

    expect(mockOfflineStore.enqueue).toHaveBeenCalledTimes(1);
    expect(mockNotification.showSuccess).toHaveBeenCalledWith('Synced 1 offline change');
    expect(mockNotification.showError).toHaveBeenCalledWith('Failed to sync 1 change');
  });

  it('should not process if queue is empty', async () => {
    mockOfflineStore.drainQueue.mockResolvedValue([]);
    const service = TestBed.inject(SyncService);
    await service.processQueue();

    expect(mockHttp.post).not.toHaveBeenCalled();
    expect(mockNotification.showSuccess).not.toHaveBeenCalled();
  });
});
