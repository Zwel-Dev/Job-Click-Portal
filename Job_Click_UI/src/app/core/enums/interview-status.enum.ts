import { StatusTone } from './application-status.enum';

/** Interview state (mirrors INTERVIEWS.status in the ERD). */
export enum InterviewStatus {
  Scheduled = 'SCHEDULED',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
  NoShow = 'NO_SHOW',
}

export const INTERVIEW_STATUS_META: Record<InterviewStatus, { label: string; tone: StatusTone }> = {
  [InterviewStatus.Scheduled]: { label: 'Scheduled', tone: 'info' },
  [InterviewStatus.Completed]: { label: 'Completed', tone: 'success' },
  [InterviewStatus.Cancelled]: { label: 'Cancelled', tone: 'neutral' },
  [InterviewStatus.NoShow]: { label: 'No-show', tone: 'danger' },
};
