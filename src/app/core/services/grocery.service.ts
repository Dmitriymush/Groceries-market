import { Injectable, inject, signal, computed } from '@angular/core';
import { GroceryApi } from '@core/api/grocery.api';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from './notification.service';
import { GroceryItem, GroceryFormData } from '@core/models/grocery.model';
import { GroceryViewHelper } from '@modules/groceries/helpers/grocery-view.helper';
import { GroceryListViewModel } from '@modules/groceries/models/grocery-view.model';

@Injectable({ providedIn: 'root' })
export class GroceryService {
  private groceryApi = inject(GroceryApi);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

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

  loadItems(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this._loading.set(true);
    this.groceryApi.getAll(user.id).subscribe({
      next: (items) => {
        this._items.set(items);
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  private silentReload(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.groceryApi.getAll(user.id).subscribe({
      next: (items) => {
        this._items.set(items);
      },
    });
  }

  addItem(formData: GroceryFormData): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.groceryApi
      .create({
        ...formData,
        bought: false,
        userId: user.id,
        createdAt: new Date().toISOString(),
      })
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Item added successfully');
          this.silentReload();
        },
      });
  }

  updateItem(id: number, changes: Partial<GroceryItem>): void {
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
