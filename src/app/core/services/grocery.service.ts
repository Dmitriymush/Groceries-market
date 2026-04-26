import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GroceryApi } from '@core/api/grocery.api';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from './notification.service';
import { GroceryWebSocketService } from './grocery-websocket.service';
import { ConnectivityService } from './connectivity.service';
import { OfflineStoreService } from './offline-store.service';
import { GroceryItem, GroceryFormData } from '@core/models/grocery.model';
import { GroceryViewHelper } from '@modules/groceries/helpers/grocery-view.helper';
import { GroceryListViewModel } from '@modules/groceries/models/grocery-view.model';
import { WsGroceryEvent } from '@core/models/websocket.model';

@Injectable({ providedIn: 'root' })
export class GroceryService {
  private groceryApi = inject(GroceryApi);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private wsService = inject(GroceryWebSocketService);
  private connectivity = inject(ConnectivityService);
  private offlineStore = inject(OfflineStoreService);
  private destroyRef = inject(DestroyRef);

  private readonly _items = signal<GroceryItem[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly vm = computed<GroceryListViewModel>(() => {
    const items = this._items();
    return {
      items: GroceryViewHelper.sortByName(items),
      loading: this._loading(),
      totalItems: items.length,
      hasItems: items.length > 0,
      boughtCount: GroceryViewHelper.countBought(items),
      remainingCount: GroceryViewHelper.countRemaining(items),
    };
  });

  constructor() {
    this.subscribeToWebSocket();
  }

  private subscribeToWebSocket(): void {
    this.wsService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.handleWsEvent(event));
  }

  private handleWsEvent(event: WsGroceryEvent): void {
    const messages: Record<string, string> = {
      item_added: `${event.payload.username} added "${event.payload.itemName}"`,
      item_updated: `${event.payload.username} updated "${event.payload.itemName}"`,
      item_deleted: `${event.payload.username} removed "${event.payload.itemName}"`,
      item_toggled: `${event.payload.username} toggled "${event.payload.itemName}"`,
    };

    this.notificationService.showInfo(messages[event.type]);
    this.silentReload();
  }

  loadItems(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this._loading.set(true);

    if (!this.connectivity.isOnline()) {
      this.loadFromOfflineStore();
      return;
    }

    this.groceryApi.getAll(user.id).subscribe({
      next: (items) => {
        this._items.set(items);
        this._loading.set(false);
        this.offlineStore.saveItems(items);
      },
      error: () => {
        this.loadFromOfflineStore();
      },
    });
  }

  private loadFromOfflineStore(): void {
    this.offlineStore.getItems().then((cached) => {
      if (cached.length > 0) {
        this._items.set(cached);
        this.notificationService.showInfo('Loaded from offline cache');
      }
      this._loading.set(false);
    });
  }

  private silentReload(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.groceryApi.getAll(user.id).subscribe({
      next: (items) => {
        this._items.set(items);
        this.offlineStore.saveItems(items);
      },
    });
  }

  addItem(formData: GroceryFormData): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const newItem = {
      ...formData,
      bought: false,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    if (!this.connectivity.isOnline()) {
      this.offlineStore.enqueue({
        method: 'POST',
        url: '/groceries',
        body: newItem,
        createdAt: new Date().toISOString(),
      });
      this.notificationService.showInfo('Saved offline — will sync when back online');
      return;
    }

    this.groceryApi.create(newItem).subscribe({
      next: () => {
        this.notificationService.showSuccess('Item added successfully');
        this.silentReload();
      },
    });
  }

  updateItem(id: number, changes: Partial<GroceryItem>): void {
    if (!this.connectivity.isOnline()) {
      this._items.update((items) =>
        items.map((i) => (i.id === id ? { ...i, ...changes } : i))
      );
      this.offlineStore.enqueue({
        method: 'PATCH',
        url: `/groceries/${id}`,
        body: changes,
        createdAt: new Date().toISOString(),
      });
      this.notificationService.showInfo('Saved offline — will sync when back online');
      return;
    }

    this.groceryApi.update(id, changes).subscribe({
      next: () => {
        this.notificationService.showSuccess('Item updated successfully');
        this.silentReload();
      },
    });
  }

  toggleBought(item: GroceryItem): void {
    this._items.update((items) =>
      items.map((i) => (i.id === item.id ? { ...i, bought: !i.bought } : i))
    );

    if (!this.connectivity.isOnline()) {
      this.offlineStore.enqueue({
        method: 'PATCH',
        url: `/groceries/${item.id}`,
        body: { bought: !item.bought },
        createdAt: new Date().toISOString(),
      });
      return;
    }

    this.groceryApi.update(item.id, { bought: !item.bought }).subscribe({
      error: () => {
        this._items.update((items) =>
          items.map((i) => (i.id === item.id ? { ...i, bought: item.bought } : i))
        );
      },
    });
  }

  deleteItem(id: number): void {
    this._items.update((items) => items.filter((i) => i.id !== id));

    if (!this.connectivity.isOnline()) {
      this.offlineStore.enqueue({
        method: 'DELETE',
        url: `/groceries/${id}`,
        body: null,
        createdAt: new Date().toISOString(),
      });
      this.notificationService.showInfo('Saved offline — will sync when back online');
      return;
    }

    this.groceryApi.delete(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Item deleted successfully');
      },
      error: () => {
        this.silentReload();
      },
    });
  }
}
