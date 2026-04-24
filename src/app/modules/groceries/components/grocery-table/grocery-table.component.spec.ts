import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ɵgetComponentDef as getComponentDef, NO_ERRORS_SCHEMA } from '@angular/core';
import { GroceryTableComponent } from './grocery-table.component';
import { GroceryItemComponent } from '../grocery-item/grocery-item.component';
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

function patchSignalInputs(componentClass: any, inputNames: string[]): void {
  const def = getComponentDef(componentClass);
  if (def && (!def.inputs || Object.keys(def.inputs).length === 0)) {
    const inputs: Record<string, [string, number, null]> = {};
    for (const name of inputNames) {
      inputs[name] = [name, 1, null];
    }
    (def as any).inputs = inputs;
  }
}

describe('GroceryTableComponent', () => {
  let fixture: ComponentFixture<GroceryTableComponent>;

  const mockItems: GroceryItem[] = [
    { id: 1, name: 'Apples', amount: 3, unit: 'pcs', bought: false, userId: 1, createdAt: '' },
    { id: 2, name: 'Milk', amount: 2, unit: 'liters', bought: true, userId: 1, createdAt: '' },
  ];

  beforeEach(() => {
    patchSignalInputs(GroceryItemComponent, ['item']);
    TestBed.configureTestingModule({
      imports: [GroceryTableComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(GroceryTableComponent);
    setInput(fixture.componentInstance, 'items', mockItems);
    fixture.detectChanges();
  });

  it('should render items', () => {
    const items = fixture.nativeElement.querySelectorAll('[data-testid="grocery-item"]');
    expect(items.length).toBe(2);
  });

  it('should show empty state when no items', () => {
    setInput(fixture.componentInstance, 'items', []);
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('[data-testid="grocery-empty"]');
    expect(empty).toBeTruthy();
  });
});
