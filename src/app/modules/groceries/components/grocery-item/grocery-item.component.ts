import { Component, input, output } from '@angular/core';
import { GroceryItem } from '@core/models/grocery.model';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { FormatHelper } from '@core/helpers/format.helper';

@Component({
  selector: 'app-grocery-item',
  standalone: true,
  imports: [Checkbox, Button, FormsModule],
  templateUrl: './grocery-item.component.html',
  styleUrl: './grocery-item.component.scss',
})
export class GroceryItemComponent {
  item = input.required<GroceryItem>();

  toggleBought = output<GroceryItem>();
  edit = output<GroceryItem>();
  delete = output<GroceryItem>();

  get formattedAmount(): string {
    const i = this.item();
    return FormatHelper.formatAmount(i.amount, i.unit);
  }

  onToggle(): void {
    this.toggleBought.emit(this.item());
  }

  onEdit(): void {
    this.edit.emit(this.item());
  }

  onDelete(): void {
    this.delete.emit(this.item());
  }
}
