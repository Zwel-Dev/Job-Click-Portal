import { AuditAction } from '@core/enums/audit-action.enum';

/** Query for the audit log list (filters + pagination). */
export interface AuditLogQuery {
  actor?: string;
  action?: AuditAction;
  entityType?: string;
  /** Inclusive ISO date bounds (yyyy-mm-dd). */
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

/** Entity types the admin trail records (drives the filter dropdown). */
export const AUDIT_ENTITY_TYPES: readonly string[] = [
  'User',
  'Company',
  'Verification',
  'Job',
  'Fraud signal',
  'Plan',
  'Skill',
  'Feature flag',
];
