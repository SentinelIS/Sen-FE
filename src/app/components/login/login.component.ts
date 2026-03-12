import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LoginUserDto } from '../../models/login-user.dto';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    ChatbotComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    company: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage: string | null = null;

  login(): void {
    if (this.form.valid) {
      this.authService.login(this.form.value as LoginUserDto).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Login failed. Please check your credentials.';
          }
        },
        error: (err) => {
          if (err.error && err.error.message) {
            this.errorMessage = `Login failed: ${err.error.message}`;
          } else {
            this.errorMessage = 'Login failed: An unknown server error occurred.';
          }
          console.error('Login failed', err);
        },
      });
    }
  }
}
