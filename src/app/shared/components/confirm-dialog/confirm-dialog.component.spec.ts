import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ɵresolveComponentResources as resolveComponentResources } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmationService } from 'primeng/api';

describe('ConfirmDialogComponent', () => {
  beforeEach(async () => {
    await resolveComponentResources(() => Promise.resolve({ text: () => Promise.resolve('') } as Response));
  });

  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [ConfirmationService],
    }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
