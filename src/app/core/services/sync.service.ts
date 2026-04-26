import { Injectable, inject, effect, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { OfflineStoreService, SyncQueueEntry } from './offline-store.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private http = inject(HttpClient);
  private connectivity = inject(ConnectivityService);
  private offlineStore = inject(OfflineStoreService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  private syncing = false;

  constructor() {
    effect(() => {
      if (this.connectivity.isOnline()) {
        this.processQueue();
      }
    });
  }

  async processQueue(): Promise<void> {
    if (this.syncing) return;
    this.syncing = true;

    try {
      const entries = await this.offlineStore.drainQueue();
      if (entries.length === 0) {
        this.syncing = false;
        return;
      }

      let succeeded = 0;
      let failed = 0;

      for (const entry of entries) {
        try {
          await this.replayEntry(entry);
          succeeded++;
        } catch {
          failed++;
          await this.offlineStore.enqueue({
            method: entry.method,
            url: entry.url,
            body: entry.body,
            createdAt: entry.createdAt,
          });
        }
      }

      if (succeeded > 0) {
        this.notificationService.showSuccess(
          `Synced ${succeeded} offline change${succeeded > 1 ? 's' : ''}`
        );
      }
      if (failed > 0) {
        this.notificationService.showError(
          `Failed to sync ${failed} change${failed > 1 ? 's' : ''}`
        );
      }
    } finally {
      this.syncing = false;
    }
  }

  private replayEntry(entry: SyncQueueEntry): Promise<unknown> {
    switch (entry.method) {
      case 'POST':
        return firstValueFrom(this.http.post(entry.url, entry.body));
      case 'PATCH':
        return firstValueFrom(this.http.patch(entry.url, entry.body));
      case 'DELETE':
        return firstValueFrom(this.http.delete(entry.url));
    }
  }
}
