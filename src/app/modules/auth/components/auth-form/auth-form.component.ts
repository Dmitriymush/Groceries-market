import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

export interface AuthFormData {
  username: string;
  password: string;
  name?: string;
}

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [FormsModule, InputText, Password, Button, TranslatePipe],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
})
export class AuthFormComponent {
  mode = input<'login' | 'signup'>('login');
  loading = input(false);
  error = input('');

  submitted = output<AuthFormData>();
  switchMode = output<void>();

  username = signal('');
  password = signal('');
  name = signal('');

  get isValid(): boolean {
    if (this.mode() === 'signup') {
      return !!this.username() && !!this.password() && !!this.name();
    }
    return !!this.username() && !!this.password();
  }

  onSubmit(): void {
    this.submitted.emit({
      username: this.username(),
      password: this.password(),
      ...(this.mode() === 'signup' ? { name: this.name() } : {}),
    });
  }

  onSwitchMode(): void {
    this.switchMode.emit();
  }
}
