export interface EmployerNavItem {
  label: string;
  icon: string;
  route: string;
  /** Visible only to Recruitment Managers / Company Admins. */
  managerOnly?: boolean;
  /** Visible only to Company Admins. */
  adminOnly?: boolean;
  /** Starts a new visually-grouped section in the sidebar. */
  group?: string;
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
  // Company administration (Company Admin only)
  { label: 'Company', icon: 'business', route: '/employer/company', adminOnly: true, group: 'Company' },
  { label: 'Team', icon: 'group', route: '/employer/team', adminOnly: true },
];
