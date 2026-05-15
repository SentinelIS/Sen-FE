import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CreateUserDto } from '../../models/create-user.dto';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
})
export class CreateUserComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  @Output() userCreated = new EventEmitter<void>();

  form = this.fb.group(
    {
      username: ['', Validators.required],
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
    return password && passwordRepeat && password.value === passwordRepeat.value
      ? null
      : { passwordsNotMatching: true };
  }

  createUser(): void {
    if (this.form.valid) {
      const currentUser = this.authService.getUser();
      const payload: CreateUserDto = {
        username: this.form.value.username!,
        firstname: this.form.value.firstname!,
        surname: this.form.value.surname!,
        role: this.form.value.role!,
        password: this.form.value.password!,
        companyId: Number(currentUser?.companyId || 0),
      };

      this.authService
        .createUser(payload)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.form.reset();
              this.userCreated.emit();
            }
          },
          error: (err) => {
            console.error('Create user failed', err);
          },
        });
    }
  }
}
