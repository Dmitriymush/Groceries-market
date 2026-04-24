import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthApi } from '@core/api/auth.api';
import { AuthHelper } from './auth.helper';
import { LoginRequest, User, StoredAuth } from '@core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authApi = inject(AuthApi);
  private router = inject(Router);

  private readonly _currentUser = signal<User | null>(null);
  private readonly _token = signal<string>('');

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => AuthHelper.isTokenValid(this._token()));

  constructor() {
    this.restoreSession();
  }

  login(request: LoginRequest): Observable<User> {
    return this.authApi.login(request).pipe(
      tap((user) => {
        this._currentUser.set(user);
        this._token.set(user.token);
        AuthHelper.storeAuth({ user, token: user.token });
      })
    );
  }

  logout(): void {
    this._currentUser.set(null);
    this._token.set('');
    AuthHelper.clearAuth();
    this.router.navigate(['/login']);
  }

  private restoreSession(): void {
    const stored = AuthHelper.getStoredAuth();
    if (stored && AuthHelper.isTokenValid(stored.token)) {
      this._currentUser.set(stored.user);
      this._token.set(stored.token);
    }
  }
}
