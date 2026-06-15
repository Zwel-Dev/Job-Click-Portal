import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { AdminContextStore } from '@features/admin/state/admin-context.store';
import { ADMIN_NAV, AdminNavBadge, AdminNavItem } from './admin-nav';

/** Platform-admin workspace shell: sidebar (with queue badges) + header + outlet. */
@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly currentUser = inject(CurrentUserStore);
  readonly context = inject(AdminContextStore);

  readonly nav = ADMIN_NAV;
  readonly isHandset = toSignal(
    this.breakpointObserver.observe('(max-width: 960px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  readonly initials = computed(() => deriveInitials(this.currentUser.displayName()));

  ngOnInit(): void {
    // Load the KPI snapshot once for the shell — drives the nav badges.
    this.context.load();
  }

  /** Resolves an item's badge to a count, or null when there is nothing to show. */
  badgeCount(item: AdminNavItem): number | null {
    if (!item.badge) {
      return null;
    }
    const counts: Record<AdminNavBadge, number> = {
      verifications: this.context.pendingVerifications(),
      fraud: this.context.openFraudSignals(),
    };
    const count = counts[item.badge];
    return count > 0 ? count : null;
  }

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
