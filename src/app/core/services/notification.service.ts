import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messageService = inject(MessageService);

  showSuccess(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail,
    });
  }

  showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
    });
  }
}
