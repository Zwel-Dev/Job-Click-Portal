import { StatusTone } from './application-status.enum';

/** Job approval workflow stage (Project_Doc §7). */
export enum JobApprovalStage {
  PendingManager = 'PENDING_MANAGER',
  PendingAdmin = 'PENDING_ADMIN',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

export const JOB_APPROVAL_STAGE_META: Record<JobApprovalStage, { label: string; tone: StatusTone }> = {
  [JobApprovalStage.PendingManager]: { label: 'Awaiting manager approval', tone: 'progress' },
  [JobApprovalStage.PendingAdmin]: { label: 'Awaiting admin approval', tone: 'progress' },
  [JobApprovalStage.Approved]: { label: 'Approved', tone: 'success' },
  [JobApprovalStage.Rejected]: { label: 'Rejected', tone: 'danger' },
};

export const JOB_APPROVAL_STAGE_LABELS: Record<JobApprovalStage, string> = {
  [JobApprovalStage.PendingManager]: 'Pending manager approval',
  [JobApprovalStage.PendingAdmin]: 'Pending admin approval',
  [JobApprovalStage.Approved]: 'Approved',
  [JobApprovalStage.Rejected]: 'Rejected',
};
