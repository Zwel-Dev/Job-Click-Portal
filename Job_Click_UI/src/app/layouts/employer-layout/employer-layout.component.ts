import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { RoleCode } from '@core/enums/role-code.enum';
import { EmployerContextStore } from '@features/employer/state/employer-context.store';
import { EMPLOYER_NAV } from './employer-nav';

/** Employer workspace shell: role-filtered sidebar + header + content outlet. */
@Component({
  selector: 'app-employer-layout',
  standalone: false,
  templateUrl: './employer-layout.component.html',
  styleUrl: './employer-layout.component.scss',
})
export class EmployerLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly currentUser = inject(CurrentUserStore);
  readonly context = inject(EmployerContextStore);

  readonly nav = computed(() =>
    EMPLOYER_NAV.filter(
      (item) =>
        (!item.managerOnly || this.context.isManager()) &&
        (!item.adminOnly || this.context.isCompanyAdmin()),
    ),
  );
  readonly isHandset = toSignal(
    this.breakpointObserver.observe('(max-width: 960px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  readonly initials = computed(() => deriveInitials(this.currentUser.displayName()));
  /** Multi-role users can hop to their candidate workspace (CA1.6 workspace switcher). */
  readonly canSwitchToCandidate = computed(() => this.currentUser.hasRole(RoleCode.Candidate));

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }
}

function deriveInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'U';
  }
  const parts = trimmed.split(/\s+/);
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}
