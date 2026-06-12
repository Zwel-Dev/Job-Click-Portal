export interface EmployerNavItem {
  label: string;
  icon: string;
  route: string;
  /** Visible only to Recruitment Managers / Company Admins. */
  managerOnly?: boolean;
}

/** Sidebar navigation for the employer workspace (Interviews deferred to Phase 2). */
export const EMPLOYER_NAV: readonly EmployerNavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/employer/dashboard' },
  { label: 'Jobs', icon: 'work_outline', route: '/employer/jobs' },
  { label: 'Approvals', icon: 'task_alt', route: '/employer/approvals', managerOnly: true },
  { label: 'Candidates', icon: 'person_search', route: '/employer/candidates' },
  { label: 'Talent Pools', icon: 'groups', route: '/employer/talent-pools' },
  { label: 'Offers', icon: 'mail_outline', route: '/employer/offers' },
  { label: 'Analytics', icon: 'insights', route: '/employer/analytics', managerOnly: true },
];
