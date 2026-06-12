export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

/** Sidebar navigation for the candidate workspace. */
export const CANDIDATE_NAV: readonly NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/candidate/dashboard' },
  { label: 'Find Jobs', icon: 'work_outline', route: '/candidate/jobs' },
  { label: 'Recommendations', icon: 'auto_awesome', route: '/candidate/recommendations' },
  { label: 'Applications', icon: 'description', route: '/candidate/applications' },
  { label: 'Saved Jobs', icon: 'bookmark_border', route: '/candidate/saved-jobs' },
  { label: 'Profile', icon: 'person_outline', route: '/candidate/profile' },
  { label: 'Resumes', icon: 'folder_open', route: '/candidate/resumes' },
  { label: 'Settings', icon: 'settings', route: '/candidate/settings' },
];
