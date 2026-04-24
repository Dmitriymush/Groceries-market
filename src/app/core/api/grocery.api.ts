import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroceryItem } from '@core/models/grocery.model';

@Injectable({ providedIn: 'root' })
export class GroceryApi {
  private http = inject(HttpClient);

  getAll(userId: number): Observable<GroceryItem[]> {
    return this.http.get<GroceryItem[]>('/groceries', {
      params: { userId: userId.toString() },
    });
  }

  create(item: Omit<GroceryItem, 'id'>): Observable<GroceryItem> {
    return this.http.post<GroceryItem>('/groceries', item);
  }

  update(id: number, changes: Partial<GroceryItem>): Observable<GroceryItem> {
    return this.http.patch<GroceryItem>(`/groceries/${id}`, changes);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/groceries/${id}`);
  }
}
