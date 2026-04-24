export type GroceryUnit = 'pcs' | 'kg' | 'liters' | 'packs';

export const GROCERY_UNITS: GroceryUnit[] = ['pcs', 'kg', 'liters', 'packs'];

export interface GroceryItem {
  id: number;
  name: string;
  amount: number;
  unit: GroceryUnit;
  bought: boolean;
  userId: number;
  createdAt: string;
}

export interface GroceryFormData {
  name: string;
  amount: number;
  unit: GroceryUnit;
}
