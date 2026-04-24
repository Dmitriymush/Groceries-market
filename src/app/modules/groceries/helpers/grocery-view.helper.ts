import { GroceryItem } from '@core/models/grocery.model';

export abstract class GroceryViewHelper {
  static sortByName(items: GroceryItem[]): GroceryItem[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }

  static filterByBought(items: GroceryItem[], bought: boolean): GroceryItem[] {
    return items.filter((item) => item.bought === bought);
  }

  static countBought(items: GroceryItem[]): number {
    return items.filter((item) => item.bought).length;
  }

  static countRemaining(items: GroceryItem[]): number {
    return items.filter((item) => !item.bought).length;
  }
}
