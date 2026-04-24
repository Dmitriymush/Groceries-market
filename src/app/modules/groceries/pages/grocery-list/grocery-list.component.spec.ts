import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GroceryListComponent } from './grocery-list.component';
import { GroceryService } from '@core/services/grocery.service';
import { AuthService } from '@core/auth/auth.service';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GroceryListComponent', () => {
  let fixture: ComponentFixture<GroceryListComponent>;
  let component: GroceryListComponent;
  let mockGroceryService: Record<string, unknown>;

  beforeEach(() => {
    const items = [
      { id: 1, name: 'Apples', amount: 3, unit: 'pcs', bought: false, userId: 1, createdAt: '' },
      { id: 2, name: 'Milk', amount: 2, unit: 'liters', bought: true, userId: 1, createdAt: '' },
    ];
    mockGroceryService = {
      items: signal(items),
      loading: signal(false),
      vm: signal({
        items,
        loading: false,
        totalItems: 2,
        hasItems: true,
        boughtCount: 1,
        remainingCount: 1,
      }),
      loadItems: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      toggleBought: vi.fn(),
      deleteItem: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [GroceryListComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: GroceryService, useValue: mockGroceryService },
        { provide: AuthService, useValue: { currentUser: signal({ id: 1, name: 'Demo' }), logout: vi.fn() } },
        MessageService,
        ConfirmationService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    TestBed.overrideComponent(GroceryListComponent, {
      set: {
        imports: [TranslatePipe, Button],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });
    fixture = TestBed.createComponent(GroceryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load items on init', () => {
    expect(mockGroceryService['loadItems']).toHaveBeenCalled();
  });

  it('should compute viewModel correctly', () => {
    const vm = component['vm']();
    expect(vm.totalItems).toBe(2);
    expect(vm.boughtCount).toBe(1);
    expect(vm.remainingCount).toBe(1);
  });

  it('should open dialog for adding', () => {
    component.onAddItem();
    expect(component.dialogVisible()).toBe(true);
    expect(component.editingItem()).toBeNull();
  });

  it('should open dialog for editing', () => {
    const item = { id: 1, name: 'Apples', amount: 3, unit: 'pcs' as const, bought: false, userId: 1, createdAt: '' };
    component.onEditItem(item);
    expect(component.dialogVisible()).toBe(true);
    expect(component.editingItem()).toEqual(item);
  });
});
