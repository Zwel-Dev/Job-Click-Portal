import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { ApiError } from '@core/models/common.model';
import { RegisterCompanyRequest } from '@core/models/auth.model';
import { PHONE_PATTERN } from '@core/constants/patterns';
import { COMPANY_SIZES, INDUSTRIES } from '@core/constants/company-options';
import { passwordsMatchValidator, strongPasswordValidator } from '@core/utils/validators';

@Component({
  selector: 'app-register-company',
  standalone: false,
  templateUrl: './register-company.component.html',
  styleUrl: './register-company.component.scss',
})
export class RegisterCompanyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly industries = INDUSTRIES;
  readonly companySizes = COMPANY_SIZES;

  readonly companyForm = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    industry: ['', [Validators.required]],
    companySize: ['', [Validators.required]],
  });

  readonly accountForm = this.fb.nonNullable.group(
    {
      adminFullName: ['', [Validators.required, Validators.minLength(2)]],
      workEmail: ['', [Validators.required, Validators.email]],
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
    if (this.companyForm.invalid || this.accountForm.invalid) {
      this.companyForm.markAllAsTouched();
      this.accountForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const company = this.companyForm.getRawValue();
    const account = this.accountForm.getRawValue();
    const request: RegisterCompanyRequest = {
      companyName: company.companyName,
      industry: company.industry,
      companySize: company.companySize,
      adminFullName: account.adminFullName,
      workEmail: account.workEmail,
      phone: account.phone,
      password: account.password,
      acceptTerms: account.acceptTerms,
    };

    this.auth
      .registerCompany(request)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => this.registeredEmail.set(result.email),
        error: (error: ApiError) =>
          this.errorMessage.set(error.message || 'Unable to register your company. Please try again.'),
      });
  }

  togglePassword(): void {
    this.hidePassword.update((hidden) => !hidden);
  }
}
