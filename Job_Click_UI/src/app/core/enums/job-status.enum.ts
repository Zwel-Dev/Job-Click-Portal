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
