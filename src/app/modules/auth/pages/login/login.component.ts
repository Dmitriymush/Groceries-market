import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, InputText, Password, Button, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  onSubmit(): void {
    this.error.set('');
    this.loading.set(true);

    this.authService
      .login({ username: this.username(), password: this.password() })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/groceries']);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('AUTH.INVALID_CREDENTIALS');
        },
      });
  }
}
