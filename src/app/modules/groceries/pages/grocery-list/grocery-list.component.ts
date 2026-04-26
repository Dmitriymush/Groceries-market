import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { GroceryService } from '@core/services/grocery.service';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/auth/auth.service';
import { GroceryWebSocketService } from '@core/services/grocery-websocket.service';
import { ConnectivityService } from '@core/services/connectivity.service';
import { SyncService } from '@core/services/sync.service';
import { GroceryItem, GroceryFormData } from '@core/models/grocery.model';
import { GroceryTableComponent } from '../../components/grocery-table/grocery-table.component';
import { GroceryFormDialogComponent } from '../../components/grocery-form-dialog/grocery-form-dialog.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-grocery-list',
  standalone: true,
  imports: [
    TranslatePipe,
    Button,
    GroceryTableComponent,
    GroceryFormDialogComponent,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './grocery-list.component.html',
  styleUrl: './grocery-list.component.scss',
})
export class GroceryListComponent implements OnInit, OnDestroy {
  private groceryService = inject(GroceryService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private translateService = inject(TranslateService);
  protected themeService = inject(ThemeService);
  private wsService = inject(GroceryWebSocketService);
  private connectivityService = inject(ConnectivityService);
  private _syncService = inject(SyncService);

  dialogVisible = signal(false);
  editingItem = signal<GroceryItem | null>(null);

  protected readonly vm = this.groceryService.vm;
  protected readonly username = computed(() => this.authService.currentUser()?.name ?? '');
  protected readonly currentLang = signal('en');
  protected readonly wsStatus = this.wsService.connectionStatus;
  protected readonly isOnline = this.connectivityService.isOnline;

  ngOnInit(): void {
    this.groceryService.loadItems();
    this.wsService.connect();
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }

  onAddItem(): void {
    this.editingItem.set(null);
    this.dialogVisible.set(true);
  }

  onEditItem(item: GroceryItem): void {
    this.editingItem.set(item);
    this.dialogVisible.set(true);
  }

  onSaveItem(formData: GroceryFormData): void {
    const editing = this.editingItem();
    if (editing) {
      this.groceryService.updateItem(editing.id, formData);
    } else {
      this.groceryService.addItem(formData);
    }
  }

  onDeleteItem(item: GroceryItem): void {
    this.confirmationService.confirm({
      message: this.translateService.instant('COMMON.CONFIRM_DELETE'),
      header: this.translateService.instant('COMMON.CONFIRM_DELETE_TITLE'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.groceryService.deleteItem(item.id),
    });
  }

  onToggleBought(item: GroceryItem): void {
    this.groceryService.toggleBought(item);
  }

  onLangChange(lang: string): void {
    this.currentLang.set(lang);
    this.translateService.use(lang);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
