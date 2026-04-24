import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GroceryApi } from './grocery.api';
import { GroceryItem } from '@core/models/grocery.model';

describe('GroceryApi', () => {
  let api: GroceryApi;
  let httpTesting: HttpTestingController;

  const mockItem: GroceryItem = {
    id: 1, name: 'Apples', amount: 3, unit: 'pcs',
    bought: false, userId: 1, createdAt: '2026-04-23T10:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), GroceryApi],
    });
    api = TestBed.inject(GroceryApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should GET groceries by userId', () => {
    api.getAll(1).subscribe((items) => {
      expect(items).toEqual([mockItem]);
    });
    const req = httpTesting.expectOne((r) => r.url.includes('/groceries') && r.params.get('userId') === '1');
    expect(req.request.method).toBe('GET');
    req.flush([mockItem]);
  });

  it('should POST a new grocery', () => {
    const newItem = { name: 'Bananas', amount: 5, unit: 'pcs' as const };
    api.create({ ...newItem, userId: 1, bought: false, createdAt: '' }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('/groceries'));
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockItem, ...newItem });
  });

  it('should PATCH a grocery', () => {
    api.update(1, { bought: true }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('/groceries/1'));
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockItem, bought: true });
  });

  it('should DELETE a grocery', () => {
    api.delete(1).subscribe();
    const req = httpTesting.expectOne((r) => r.url.includes('/groceries/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
