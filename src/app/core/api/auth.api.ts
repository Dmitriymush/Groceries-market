import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { LoginRequest, SignupRequest, User } from '@core/models/auth.model';

interface UserRecord {
  id: number;
  username: string;
  password: string;
  name: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);

  login(request: LoginRequest): Observable<User> {
    return this.http
      .get<UserRecord[]>('/users', {
        params: { username: request.username },
      })
      .pipe(
        map((users) => {
          const user = users.find(
            (u) => u.username === request.username && u.password === request.password
          );
          if (!user) {
            throw new Error('Invalid credentials');
          }
          const { password, ...safeUser } = user;
          return safeUser;
        })
      );
  }

  signup(request: SignupRequest): Observable<User> {
    return this.http
      .get<UserRecord[]>('/users', {
        params: { username: request.username },
      })
      .pipe(
        map((users) => {
          if (users.some((u) => u.username === request.username)) {
            throw new Error('Username already exists');
          }
          return null;
        }),
        switchMap(() =>
          this.http.post<UserRecord>('/users', {
            username: request.username,
            password: request.password,
            name: request.name,
            token: `mock-jwt-token-${request.username}`,
          })
        ),
        map((user) => {
          const { password, ...safeUser } = user;
          return safeUser;
        })
      );
  }
}
