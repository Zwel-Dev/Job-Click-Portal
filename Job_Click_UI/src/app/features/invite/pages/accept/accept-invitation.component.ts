import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { InvitationService } from '@core/services/invitation.service';
import { ApiError } from '@core/models/common.model';
import { InvitationPreview } from '@core/models/invitation.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { roleLabel } from '@core/utils/role-label';

type AcceptView = 'loading' | 'invalid' | 'mismatch' | 'accept' | 'register' | 'signin';

@Component({
  selector: 'app-accept-invitation',
  standalone: false,
  templateUrl: './accept-invitation.component.html',
  styleUrl: './accept-invitation.component.scss',
})
export class AcceptInvitationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invitations = inject(InvitationService);
  private readonly auth = inject(AuthService);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly view = signal<AcceptView>('loading');
  readonly submitting = signal(false);
  readonly preview = signal<InvitationPreview | null>(null);

  readonly roleLabel = roleLabel;
  readonly signedInEmail = computed(() => this.currentUser.user()?.email ?? '');

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.preview.set({ companyName: '', role: RoleCode.Recruiter, email: '', needsAccount: false, valid: false, reason: 'not_found' });
      this.view.set('invalid');
      return;
    }
    this.invitations.getByToken(this.token).subscribe((preview) => {
      this.preview.set(preview);
      this.resolveView(preview);
    });
  }

  accept(): void {
    this.submitting.set(true);
    this.invitations
      .acceptAsCurrentUser(this.token)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.done(),
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { fullName, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.invitations
      .acceptAsNewUser(this.token, { fullName: fullName.trim(), password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.done(),
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  reasonMessage(): string {
    switch (this.preview()?.reason) {
      case 'expired':
        return 'This invitation has expired. Ask the company admin to send a new one.';
      case 'revoked':
        return 'This invitation has been revoked.';
      case 'accepted':
        return 'This invitation has already been accepted.';
      default:
        return 'This invitation link is invalid.';
    }
  }

  private resolveView(preview: InvitationPreview): void {
    if (!preview.valid) {
      this.view.set('invalid');
      return;
    }
    const user = this.currentUser.user();
    if (user) {
      this.view.set(user.email.toLowerCase() === preview.email.toLowerCase() ? 'accept' : 'mismatch');
    } else {
      this.view.set(preview.needsAccount ? 'register' : 'signin');
    }
  }

  private done(): void {
    this.toast.success(`Welcome to ${this.preview()?.companyName ?? 'the company'}.`);
    this.router.navigateByUrl('/employer/dashboard');
  }
}
