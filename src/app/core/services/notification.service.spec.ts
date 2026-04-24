import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MessageService } from 'primeng/api';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockMessageService: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockMessageService = { add: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MessageService, useValue: mockMessageService },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should call messageService.add with success severity', () => {
    service.showSuccess('Done');
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Done',
    });
  });

  it('should call messageService.add with error severity', () => {
    service.showError('Failed');
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed',
    });
  });
});
