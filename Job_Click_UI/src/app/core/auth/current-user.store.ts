import { Injectable, computed, signal } from '@angular/core';
import { User } from '@core/models/user.model';
import { RoleCode } from '@core/enums/role-code.enum';

/** Signal-based store for the authenticated user. The single source of UI auth state. */
@Injectable({ providedIn: 'root' })
export class CurrentUserStore {
  private readonly userState = signal<User | null>(null);

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly roles = computed<RoleCode[]>(() => this.userState()?.roles ?? []);
  readonly displayName = computed(() => this.userState()?.fullName ?? '');

  setUser(user: User | null): void {
    this.userState.set(user);
  }

  hasRole(role: RoleCode): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: readonly RoleCode[]): boolean {
    return roles.some((role) => this.roles().includes(role));
  }
}
