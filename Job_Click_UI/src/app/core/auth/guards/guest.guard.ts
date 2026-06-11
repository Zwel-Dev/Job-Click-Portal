import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { defaultRouteForRoles } from '@core/auth/home-route';

/** Allows access only to anonymous visitors; signed-in users go to their workspace home. */
export const guestGuard: CanActivateFn = () => {
  const currentUser = inject(CurrentUserStore);
  const router = inject(Router);

  if (!currentUser.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree([defaultRouteForRoles(currentUser.roles())]);
};
