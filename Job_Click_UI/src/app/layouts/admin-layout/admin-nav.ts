/** Which `AdminContextStore` queue-count signal drives an item's badge. */
export type AdminNavBadge = 'verifications' | 'fraud';

export interface AdminNavItem {
  label: string;
  icon: string;
  route: string;
  /** Shows a live count pill sourced from `AdminContextStore`. */
  badge?: AdminNavBadge;
  /** Starts a new visually-grouped section in the sidebar. */
  group?: string;
}

/**
 * Sidebar navigation for the platform-admin workspace. Phase-1 screens are the
 * core; the "Integrity" group (P2) and "Commerce" (P3) land in later slices but
 * are shown so the operator can see the full console surface.
 */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'Users', icon: 'group', route: '/admin/users' },
  { label: 'Companies', icon: 'business', route: '/admin/companies' },
  { label: 'Verifications', icon: 'verified_user', route: '/admin/verifications', badge: 'verifications' },
  // Integrity & insight (P2)
  { label: 'Job Moderation', icon: 'gavel', route: '/admin/jobs', group: 'Integrity' },
  { label: 'Fraud', icon: 'shield', route: '/admin/fraud', badge: 'fraud' },
  { label: 'Analytics', icon: 'insights', route: '/admin/analytics' },
  { label: 'Audit Logs', icon: 'history', route: '/admin/audit-logs' },
  { label: 'Settings', icon: 'settings', route: '/admin/settings' },
  // Commerce (P3)
  { label: 'Subscriptions', icon: 'card_membership', route: '/admin/subscriptions', group: 'Commerce' },
];
