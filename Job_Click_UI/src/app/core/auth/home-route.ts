import { RoleCode, EMPLOYER_ROLES } from '@core/enums/role-code.enum';

/**
 * Default landing route for a signed-in user, by primary role.
 *
 * Only the candidate workspace exists today; employer/admin fall back to the
 * temporary `/welcome` page until those workspaces are built. Extend this as
 * each workspace lands (single place to update).
 */
export function defaultRouteForRoles(roles: readonly RoleCode[]): string {
  if (roles.includes(RoleCode.Candidate)) {
    return '/candidate/dashboard';
  }
  if (roles.includes(RoleCode.PlatformAdmin)) {
    return '/welcome'; // TODO: '/admin/dashboard'
  }
  if (roles.some((role) => EMPLOYER_ROLES.includes(role))) {
    return '/welcome'; // TODO: '/employer/dashboard'
  }
  return '/welcome';
}
