import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { SetupDto } from '../../models/setup.dto';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-setup',
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
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
})
export class SetupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group(
    {
      companyName: ['', Validators.required],
      companyDesc: [''],
      userAbbr: ['', Validators.required],
      firstname: ['', Validators.required],
      surname: ['', Validators.required],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordRepeat: ['', Validators.required],
    },
    { validators: this.passwordsMatchValidator },
  );

  passwordsMatchValidator(form: any) {
    const password = form.get('password');
    const passwordRepeat = form.get('passwordRepeat');
    return password && passwordRepeat && password.value === passwordRepeat.value ? null : { passwordsNotMatching: true };
  }

  setup(): void {
    if (this.form.valid) {
      this.authService.setup(this.form.value as SetupDto).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.error('Setup failed', err);
        },
      });
    }
  }
}
