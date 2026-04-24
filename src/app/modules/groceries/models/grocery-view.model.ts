import { GroceryItem } from '@core/models/grocery.model';

export interface GroceryListViewModel {
  items: GroceryItem[];
  loading: boolean;
  totalItems: number;
  hasItems: boolean;
  boughtCount: number;
  remainingCount: number;
}
