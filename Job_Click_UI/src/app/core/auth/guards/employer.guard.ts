import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { defaultRouteForRoles } from '@core/auth/home-route';
import { EMPLOYER_ROLES } from '@core/enums/role-code.enum';

/** Allows any company user (Company Admin / Recruitment Manager / Recruiter / Hiring Manager). */
export const employerGuard: CanActivateFn = () => {
  const currentUser = inject(CurrentUserStore);
  const router = inject(Router);

  if (currentUser.hasAnyRole(EMPLOYER_ROLES)) {
    return true;
  }
  return router.createUrlTree([defaultRouteForRoles(currentUser.roles())]);
};
