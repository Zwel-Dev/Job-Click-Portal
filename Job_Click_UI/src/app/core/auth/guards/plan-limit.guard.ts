import { CanActivateFn } from '@angular/router';

/**
 * Gate actions by subscription plan quota (e.g. `max_jobs`). Stubbed to always
 * allow until billing lands (Phase 3); then check the company's plan usage and
 * redirect to an upgrade prompt when exceeded.
 */
export const planLimitGuard: CanActivateFn = () => {
  return true;
};
