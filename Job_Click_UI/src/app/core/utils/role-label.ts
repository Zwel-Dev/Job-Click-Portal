import { RoleCode } from '@core/enums/role-code.enum';

/** Human-readable label for a role code. */
export function roleLabel(role: RoleCode | undefined): string {
  switch (role) {
    case RoleCode.PlatformAdmin:
      return 'Platform Admin';
    case RoleCode.CompanyAdmin:
      return 'Company Admin';
    case RoleCode.RecruitmentManager:
      return 'Recruitment Manager';
    case RoleCode.Recruiter:
      return 'Recruiter';
    case RoleCode.HiringManager:
      return 'Hiring Manager';
    case RoleCode.Candidate:
      return 'Candidate';
    default:
      return 'User';
  }
}
