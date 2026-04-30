import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AuthFormComponent, AuthFormData } from '../../components/auth-form/auth-form.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [AuthFormComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  error = signal('');
  loading = signal(false);

  onSubmit(data: AuthFormData): void {
    this.error.set('');
    this.loading.set(true);

    this.authService
      .signup({ username: data.username, password: data.password, name: data.name! })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/login']);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('AUTH.SIGNUP_ERROR');
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
