import { describe, it, expect } from 'vitest';
import { GroceryViewHelper } from './grocery-view.helper';
import { GroceryItem } from '@core/models/grocery.model';

const mockItems: GroceryItem[] = [
  { id: 1, name: 'Apples', amount: 3, unit: 'pcs', bought: false, userId: 1, createdAt: '2026-04-23T10:00:00Z' },
  { id: 2, name: 'Milk', amount: 2, unit: 'liters', bought: true, userId: 1, createdAt: '2026-04-23T10:01:00Z' },
  { id: 3, name: 'Bread', amount: 1, unit: 'pcs', bought: false, userId: 1, createdAt: '2026-04-23T10:02:00Z' },
];

describe('GroceryViewHelper', () => {
  it('should sort by name ascending', () => {
    const sorted = GroceryViewHelper.sortByName(mockItems);
    expect(sorted[0].name).toBe('Apples');
    expect(sorted[1].name).toBe('Bread');
    expect(sorted[2].name).toBe('Milk');
  });

  it('should filter bought items', () => {
    const bought = GroceryViewHelper.filterByBought(mockItems, true);
    expect(bought.length).toBe(1);
    expect(bought[0].name).toBe('Milk');
  });

  it('should filter not-bought items', () => {
    const notBought = GroceryViewHelper.filterByBought(mockItems, false);
    expect(notBought.length).toBe(2);
  });

  it('should count bought', () => {
    expect(GroceryViewHelper.countBought(mockItems)).toBe(1);
  });

  it('should count remaining', () => {
    expect(GroceryViewHelper.countRemaining(mockItems)).toBe(2);
  });
});
