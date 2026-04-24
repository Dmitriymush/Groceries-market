import { Component, input, output } from '@angular/core';
import { GroceryItem } from '@core/models/grocery.model';
import { GroceryItemComponent } from '../grocery-item/grocery-item.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-grocery-table',
  standalone: true,
  imports: [GroceryItemComponent, TranslatePipe],
  templateUrl: './grocery-table.component.html',
  styleUrl: './grocery-table.component.scss',
})
export class GroceryTableComponent {
  items = input.required<GroceryItem[]>();

  toggleBought = output<GroceryItem>();
  editItem = output<GroceryItem>();
  deleteItem = output<GroceryItem>();
}
