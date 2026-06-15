import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { defaultRouteForRoles } from '@core/auth/home-route';
import { RoleCode } from '@core/enums/role-code.enum';

/** Allows access only to platform-scoped admins (the operator console). */
export const adminGuard: CanActivateFn = () => {
  const currentUser = inject(CurrentUserStore);
  const router = inject(Router);

  if (currentUser.hasRole(RoleCode.PlatformAdmin)) {
    return true;
  }

  // Authenticated but not a platform admin — send to their own workspace.
  return router.createUrlTree([defaultRouteForRoles(currentUser.roles())]);
};
