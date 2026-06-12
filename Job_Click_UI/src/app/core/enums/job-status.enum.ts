import { StatusTone } from './application-status.enum';

/** Job posting lifecycle (mirrors JOBS.status in the ERD). */
export enum JobStatus {
  Draft = 'DRAFT',
  PendingApproval = 'PENDING_APPROVAL',
  Published = 'PUBLISHED',
  Paused = 'PAUSED',
  Closed = 'CLOSED',
  Archived = 'ARCHIVED',
  Expired = 'EXPIRED',
}

export const JOB_STATUS_META: Record<JobStatus, { label: string; tone: StatusTone }> = {
  [JobStatus.Draft]: { label: 'Draft', tone: 'neutral' },
  [JobStatus.PendingApproval]: { label: 'Pending approval', tone: 'progress' },
  [JobStatus.Published]: { label: 'Published', tone: 'success' },
  [JobStatus.Paused]: { label: 'Paused', tone: 'info' },
  [JobStatus.Closed]: { label: 'Closed', tone: 'neutral' },
  [JobStatus.Archived]: { label: 'Archived', tone: 'neutral' },
  [JobStatus.Expired]: { label: 'Expired', tone: 'danger' },
};
