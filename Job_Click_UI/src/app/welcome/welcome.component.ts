import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { roleLabel } from '@core/utils/role-label';

/**
 * Temporary post-login landing. Confirms the authenticated session works while
 * the role-specific workspaces (candidate / employer / admin) are being built.
 */
@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = inject(CurrentUserStore);
  readonly roleLabels = computed(() => this.currentUser.roles().map((role) => roleLabel(role)));

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
