import { Injectable } from '@angular/core';
import { GroceryItem } from '@core/models/grocery.model';

const DB_NAME = 'grocery_offline_db';
const DB_VERSION = 1;
const ITEMS_STORE = 'grocery_items';
const QUEUE_STORE = 'sync_queue';

export interface SyncQueueEntry {
  id?: number;
  method: 'POST' | 'PATCH' | 'DELETE';
  url: string;
  body: unknown;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OfflineStoreService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ITEMS_STORE)) {
          db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async saveItems(items: GroceryItem[]): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(ITEMS_STORE, 'readwrite');
    const store = tx.objectStore(ITEMS_STORE);

    store.clear();
    items.forEach((item) => store.put(item));

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getItems(): Promise<GroceryItem[]> {
    const db = await this.openDb();
    const tx = db.transaction(ITEMS_STORE, 'readonly');
    const store = tx.objectStore(ITEMS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async enqueue(entry: Omit<SyncQueueEntry, 'id'>): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).add(entry);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async drainQueue(): Promise<SyncQueueEntry[]> {
    const db = await this.openDb();
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const entries: SyncQueueEntry[] = request.result;
        store.clear();
        tx.oncomplete = () => resolve(entries);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getQueueSize(): Promise<number> {
    const db = await this.openDb();
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const request = tx.objectStore(QUEUE_STORE).count();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
