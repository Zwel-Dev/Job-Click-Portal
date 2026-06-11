import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from '@core/auth/current-user.store';

/**
 * Allows access only to anonymous visitors; signed-in users are sent to their
 * home. (Temporary: `/welcome` until role-based workspaces exist.)
 */
export const guestGuard: CanActivateFn = () => {
  const currentUser = inject(CurrentUserStore);
  const router = inject(Router);

  return currentUser.isAuthenticated() ? router.createUrlTree(['/welcome']) : true;
};
