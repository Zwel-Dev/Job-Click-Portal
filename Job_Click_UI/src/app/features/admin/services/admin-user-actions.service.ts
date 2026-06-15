import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { ApiError } from '@core/models/common.model';
import { AdminUser } from '@core/models/admin-user.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { UserStatus } from '@core/enums/user-status.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { AdminUserService } from './admin-user.service';

/**
 * Mutating user actions shared by the list and the detail drawer — suspend /
 * reactivate and password reset. Centralises the confirm dialogs, success /
 * error toasts, and the §11 self / Platform-Admin guardrails so both call sites
 * behave identically.
 */
@Injectable({ providedIn: 'root' })
export class AdminUserActionsService {
  private readonly service = inject(AdminUserService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly currentUser = inject(CurrentUserStore);

  /** True when the row is the signed-in admin (cannot self-suspend). */
  isSelf(user: AdminUser): boolean {
    return this.currentUser.user()?.id === user.id;
  }

  /**
   * Suspend or reactivate `user` (the inverse of its current state) with a
   * confirm step. Resolves to the updated user, or `null` if cancelled, blocked,
   * or failed.
   */
  toggleStatus(user: AdminUser): Observable<AdminUser | null> {
    const suspending = user.status !== UserStatus.Suspended;

    if (suspending && this.isSelf(user)) {
      this.toast.error('You cannot suspend your own account.');
      return of(null);
    }

    const action = suspending ? 'Suspend' : 'Reactivate';
    const first$ = this.confirm.confirm({
      title: `${action} ${user.fullName}?`,
      message: suspending
        ? `${user.fullName} will be signed out and blocked from signing in until an admin reactivates the account.`
        : `${user.fullName} will regain access to their account.`,
      confirmLabel: action,
      danger: suspending,
    });

    return first$.pipe(
      switchMap((confirmed) => {
        if (!confirmed) {
          return of(null);
        }
        // Guardrail: suspending another Platform Admin requires a second confirm.
        if (suspending && user.roles.includes(RoleCode.PlatformAdmin)) {
          return this.confirm
            .confirm({
              title: 'Suspend a Platform Admin?',
              message: `${user.fullName} is a Platform Admin. Suspending them revokes access to the operator console. This is a sensitive action — please confirm again.`,
              confirmLabel: 'Suspend admin',
              danger: true,
            })
            .pipe(switchMap((again) => (again ? this.applyStatus(user, suspending) : of(null))));
        }
        return this.applyStatus(user, suspending);
      }),
    );
  }

  /** Send a password-reset link with a confirm step. Resolves true when sent. */
  resetPassword(user: AdminUser): Observable<boolean> {
    return this.confirm
      .confirm({
        title: 'Send password reset link?',
        message: `A reset link will be emailed to ${user.email}. Their current password stays valid until they choose a new one.`,
        confirmLabel: 'Send link',
      })
      .pipe(
        switchMap((confirmed) => {
          if (!confirmed) {
            return of(false);
          }
          return this.service.resetPassword(user.id).pipe(
            map(() => {
              this.toast.success(`Password reset link sent to ${user.email}.`);
              return true;
            }),
            catchError((error: ApiError) => {
              this.toast.error(error.message ?? 'Could not send the reset link.');
              return of(false);
            }),
          );
        }),
      );
  }

  private applyStatus(user: AdminUser, suspending: boolean): Observable<AdminUser | null> {
    const next = suspending ? UserStatus.Suspended : UserStatus.Active;
    return this.service.setStatus(user.id, next).pipe(
      tap((updated) =>
        this.toast.success(
          suspending ? `${updated.fullName} has been suspended.` : `${updated.fullName} has been reactivated.`,
        ),
      ),
      catchError((error: ApiError) => {
        this.toast.error(error.message ?? 'Could not update the account.');
        return of(null);
      }),
    );
  }
}
