import { GroceryUnit } from '@core/models/grocery.model';

export abstract class FormatHelper {
  static formatAmount(amount: number, unit: GroceryUnit): string {
    return `${amount} ${unit}`;
  }

  static formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString();
  }
}
