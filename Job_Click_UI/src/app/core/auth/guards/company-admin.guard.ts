import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { defaultRouteForRoles } from '@core/auth/home-route';
import { RoleCode } from '@core/enums/role-code.enum';

/** Allows Company Admin only (company profile, team, billing). */
export const companyAdminGuard: CanActivateFn = () => {
  const currentUser = inject(CurrentUserStore);
  const router = inject(Router);

  if (currentUser.hasRole(RoleCode.CompanyAdmin)) {
    return true;
  }
  return router.createUrlTree([defaultRouteForRoles(currentUser.roles())]);
};
