import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GroceryFormDialogComponent } from './grocery-form-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

function setInput<T extends object>(component: T, key: keyof T, value: unknown): void {
  const signalFn = component[key] as any;
  const symbols = Object.getOwnPropertySymbols(signalFn);
  const signalSymbol = symbols.find((s) => s.toString() === 'Symbol(SIGNAL)');
  if (signalSymbol) {
    const node = signalFn[signalSymbol];
    node.applyValueToInputSignal(node, value);
  }
}

describe('GroceryFormDialogComponent', () => {
  let fixture: ComponentFixture<GroceryFormDialogComponent>;
  let component: GroceryFormDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GroceryFormDialogComponent, TranslateModule.forRoot(), NoopAnimationsModule],
    });
    fixture = TestBed.createComponent(GroceryFormDialogComponent);
    component = fixture.componentInstance;
    setInput(component, 'visible', true);
    setInput(component, 'editItem', null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid with empty name', () => {
    expect(component.isValid).toBe(false);
  });

  it('should be valid with name and amount', () => {
    component.name.set('Apples');
    component.amount.set(3);
    expect(component.isValid).toBe(true);
  });

  it('should emit save with form data', () => {
    const spy = vi.fn();
    component.save.subscribe(spy);
    component.name.set('Apples');
    component.amount.set(3);
    component.unit.set('kg');
    component.onSave();
    expect(spy).toHaveBeenCalledWith({ name: 'Apples', amount: 3, unit: 'kg' });
  });

  it('should populate fields when editing', () => {
    const editItem = {
      id: 1, name: 'Milk', amount: 2, unit: 'liters' as const,
      bought: false, userId: 1, createdAt: '',
    };
    setInput(component, 'editItem', editItem);
    fixture.detectChanges();
    expect(component.name()).toBe('Milk');
    expect(component.amount()).toBe(2);
    expect(component.unit()).toBe('liters');
  });
});
