import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GroceryItemComponent } from './grocery-item.component';
import { GroceryItem } from '@core/models/grocery.model';
import { TranslateModule } from '@ngx-translate/core';

function setInput<T extends object>(component: T, key: keyof T, value: unknown): void {
  const signalFn = component[key] as any;
  const symbols = Object.getOwnPropertySymbols(signalFn);
  const signalSymbol = symbols.find((s) => s.toString() === 'Symbol(SIGNAL)');
  if (signalSymbol) {
    const node = signalFn[signalSymbol];
    node.applyValueToInputSignal(node, value);
  }
}

describe('GroceryItemComponent', () => {
  let fixture: ComponentFixture<GroceryItemComponent>;

  const mockItem: GroceryItem = {
    id: 1, name: 'Apples', amount: 3, unit: 'pcs',
    bought: false, userId: 1, createdAt: '2026-04-23T10:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GroceryItemComponent, TranslateModule.forRoot()],
    });
    fixture = TestBed.createComponent(GroceryItemComponent);
    setInput(fixture.componentInstance, 'item', mockItem);
    fixture.detectChanges();
  });

  it('should display item name', () => {
    const name = fixture.nativeElement.querySelector('[data-testid="grocery-item-name"]');
    expect(name.textContent.trim()).toContain('Apples');
  });

  it('should display formatted amount', () => {
    const amount = fixture.nativeElement.querySelector('[data-testid="grocery-item-amount"]');
    expect(amount.textContent.trim()).toContain('3 pcs');
  });

  it('should apply bought-text class when bought', () => {
    setInput(fixture.componentInstance, 'item', { ...mockItem, bought: true });
    fixture.detectChanges();
    const name = fixture.nativeElement.querySelector('[data-testid="grocery-item-name"]');
    expect(name.classList.contains('bought-text')).toBe(true);
  });

  it('should emit edit event', () => {
    const spy = vi.fn();
    fixture.componentInstance.edit.subscribe(spy);
    fixture.componentInstance.onEdit();
    expect(spy).toHaveBeenCalledWith(mockItem);
  });

  it('should emit delete event', () => {
    const spy = vi.fn();
    fixture.componentInstance.delete.subscribe(spy);
    fixture.componentInstance.onDelete();
    expect(spy).toHaveBeenCalledWith(mockItem);
  });
});
