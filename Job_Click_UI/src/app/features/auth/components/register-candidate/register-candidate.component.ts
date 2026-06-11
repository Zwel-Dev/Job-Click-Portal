import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { ApiError } from '@core/models/common.model';
import { PHONE_PATTERN } from '@core/constants/patterns';
import { passwordsMatchValidator, strongPasswordValidator } from '@core/utils/validators';

@Component({
  selector: 'app-register-candidate',
  standalone: false,
  templateUrl: './register-candidate.component.html',
  styleUrl: './register-candidate.component.scss',
})
export class RegisterCandidateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatchValidator('password', 'confirmPassword') },
  );

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);
  readonly registeredEmail = signal<string | null>(null);

  submit(): void {
    if (this.submitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { fullName, email, phone, password, acceptTerms } = this.form.getRawValue();

    this.auth
      .registerCandidate({ fullName, email, phone, password, acceptTerms })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => this.registeredEmail.set(result.email),
        error: (error: ApiError) =>
          this.errorMessage.set(error.message || 'Unable to create your account. Please try again.'),
      });
  }

  togglePassword(): void {
    this.hidePassword.update((hidden) => !hidden);
  }
}
