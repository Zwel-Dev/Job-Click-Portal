/** Platform roles (mirrors ROLES.code in the ERD). */
export enum RoleCode {
  PlatformAdmin = 'PLATFORM_ADMIN',
  CompanyAdmin = 'COMPANY_ADMIN',
  RecruitmentManager = 'RECRUITMENT_MANAGER',
  Recruiter = 'RECRUITER',
  HiringManager = 'HIRING_MANAGER',
  Candidate = 'CANDIDATE',
}

/** Roles that belong to the employer (company) workspace. */
export const EMPLOYER_ROLES: readonly RoleCode[] = [
  RoleCode.CompanyAdmin,
  RoleCode.RecruitmentManager,
  RoleCode.Recruiter,
  RoleCode.HiringManager,
];
