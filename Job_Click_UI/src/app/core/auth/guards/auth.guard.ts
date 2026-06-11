import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from '@core/auth/current-user.store';

/** Allows access only to authenticated users; otherwise redirects to login. */
export const authGuard: CanActivateFn = (_route, state) => {
  const currentUser = inject(CurrentUserStore);
  const router = inject(Router);

  if (currentUser.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
