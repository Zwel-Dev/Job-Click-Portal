import { StatusTone } from './application-status.enum';

/** Categories of admin mutating action recorded in AUDIT_LOGS (PA2.3). */
export enum AuditAction {
  Create = 'CREATE',
  Update = 'UPDATE',
  Suspend = 'SUSPEND',
  Reactivate = 'REACTIVATE',
  Approve = 'APPROVE',
  Reject = 'REJECT',
  Delete = 'DELETE',
}

export const AUDIT_ACTION_META: Record<AuditAction, { label: string; tone: StatusTone }> = {
  [AuditAction.Create]: { label: 'Create', tone: 'info' },
  [AuditAction.Update]: { label: 'Update', tone: 'neutral' },
  [AuditAction.Suspend]: { label: 'Suspend', tone: 'danger' },
  [AuditAction.Reactivate]: { label: 'Reactivate', tone: 'success' },
  [AuditAction.Approve]: { label: 'Approve', tone: 'success' },
  [AuditAction.Reject]: { label: 'Reject', tone: 'danger' },
  [AuditAction.Delete]: { label: 'Delete', tone: 'danger' },
};
