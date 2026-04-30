import { Component, input, output, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GroceryItem, GroceryFormData, GROCERY_UNITS } from '@core/models/grocery.model';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';

@Component({
  selector: 'app-grocery-form-dialog',
  standalone: true,
  imports: [FormsModule, Dialog, InputText, InputNumber, Select, Button, TranslatePipe, AutoFocusDirective],
  templateUrl: './grocery-form-dialog.component.html',
  styleUrl: './grocery-form-dialog.component.scss',
})
export class GroceryFormDialogComponent {
  private translateService = inject(TranslateService);

  visible = input.required<boolean>();
  editItem = input<GroceryItem | null>(null);

  visibleChange = output<boolean>();
  save = output<GroceryFormData>();

  name = signal('');
  amount = signal(1);
  unit = signal<string>('pcs');

  get unitOptions() {
    return GROCERY_UNITS.map((u) => ({
      label: this.translateService.instant(`GROCERIES.UNITS.${u}`),
      value: u,
    }));
  }

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      const item = this.editItem();
      if (isVisible) {
        if (item) {
          this.name.set(item.name);
          this.amount.set(item.amount);
          this.unit.set(item.unit);
        } else {
          this.name.set('');
          this.amount.set(1);
          this.unit.set('pcs');
        }
      }
    });
  }

  get dialogTitle(): string {
    return this.editItem() ? 'GROCERIES.EDIT' : 'GROCERIES.ADD';
  }

  get isValid(): boolean {
    return this.name().trim().length > 0 && this.amount() > 0;
  }

  onSave(): void {
    if (!this.isValid) return;
    this.save.emit({
      name: this.name().trim(),
      amount: this.amount(),
      unit: this.unit() as GroceryFormData['unit'],
    });
    this.onClose();
  }

  onClose(): void {
    this.name.set('');
    this.amount.set(1);
    this.unit.set('pcs');
    this.visibleChange.emit(false);
  }
}
