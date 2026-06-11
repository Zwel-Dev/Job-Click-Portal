import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '@env';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { defaultRouteForRoles } from '@core/auth/home-route';
import { ApiError } from '@core/models/common.model';
import { MOCK_AUTH_USERS, MOCK_DEMO_PASSWORD } from '@core/auth/mock/mock-users';
import { roleLabel } from '@core/utils/role-label';

interface DemoAccount {
  email: string;
  role: string;
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);

  readonly showDemo = environment.useMock;
  readonly demoPassword = MOCK_DEMO_PASSWORD;
  readonly demoAccounts: DemoAccount[] = MOCK_AUTH_USERS.map((user) => ({
    email: user.email,
    role: roleLabel(user.roles[0]),
  }));

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

    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.redirectAfterLogin(),
        error: (error: ApiError) =>
          this.errorMessage.set(error.message || 'Unable to sign in. Please try again.'),
      });
  }

  togglePassword(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  fillDemo(email: string): void {
    this.form.patchValue({ email, password: this.demoPassword });
    this.errorMessage.set(null);
  }

  private redirectAfterLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl ?? defaultRouteForRoles(this.currentUser.roles()));
  }
}
