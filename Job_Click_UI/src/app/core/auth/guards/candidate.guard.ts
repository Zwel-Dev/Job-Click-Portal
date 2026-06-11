import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { defaultRouteForRoles } from '@core/auth/home-route';
import { RoleCode } from '@core/enums/role-code.enum';

/** Allows access only to users holding the Candidate role. */
export const candidateGuard: CanActivateFn = () => {
  const currentUser = inject(CurrentUserStore);
  const router = inject(Router);

  if (currentUser.hasRole(RoleCode.Candidate)) {
    return true;
  }

  // Authenticated but not a candidate — send to their own workspace.
  return router.createUrlTree([defaultRouteForRoles(currentUser.roles())]);
};
