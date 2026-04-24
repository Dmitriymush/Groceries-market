import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/auth/auth.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let mockAuthService: { login: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = { login: vi.fn() };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [LoginComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /groceries on successful login', () => {
    mockAuthService.login.mockReturnValue(of({ id: 1, username: 'demo', name: 'Demo', token: 'tok' }));
    component.username.set('demo');
    component.password.set('demo123');
    component.onSubmit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/groceries']);
  });

  it('should set error on failed login', () => {
    mockAuthService.login.mockReturnValue(throwError(() => new Error('fail')));
    component.username.set('wrong');
    component.password.set('wrong');
    component.onSubmit();
    expect(component.error()).toBe('AUTH.INVALID_CREDENTIALS');
  });
});
