import { RoleCode, EMPLOYER_ROLES } from '@core/enums/role-code.enum';

/**
 * Default landing route for a signed-in user, by primary role.
 *
 * Candidate, employer, and platform-admin workspaces each have their own shell;
 * users with no recognised role fall back to `/welcome`. Extend this as each
 * workspace lands (single place to update).
 */
export function defaultRouteForRoles(roles: readonly RoleCode[]): string {
  if (roles.includes(RoleCode.Candidate)) {
    return '/candidate/dashboard';
  }
  if (roles.includes(RoleCode.PlatformAdmin)) {
    return '/admin/dashboard';
  }
  if (roles.some((role) => EMPLOYER_ROLES.includes(role))) {
    return '/employer/dashboard';
  }
  return '/welcome';
}
