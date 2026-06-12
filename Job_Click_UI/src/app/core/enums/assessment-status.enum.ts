import { StatusTone } from './application-status.enum';

/** Assessment state (mirrors ASSESSMENTS.status in the ERD). */
export enum AssessmentStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Submitted = 'SUBMITTED',
  Passed = 'PASSED',
  Failed = 'FAILED',
}

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  [AssessmentStatus.Pending]: 'Pending',
  [AssessmentStatus.InProgress]: 'In progress',
  [AssessmentStatus.Submitted]: 'Submitted',
  [AssessmentStatus.Passed]: 'Passed',
  [AssessmentStatus.Failed]: 'Failed',
};

export const ASSESSMENT_STATUS_META: Record<AssessmentStatus, { label: string; tone: StatusTone }> = {
  [AssessmentStatus.Pending]: { label: 'Pending', tone: 'neutral' },
  [AssessmentStatus.InProgress]: { label: 'In progress', tone: 'progress' },
  [AssessmentStatus.Submitted]: { label: 'Submitted', tone: 'info' },
  [AssessmentStatus.Passed]: { label: 'Passed', tone: 'success' },
  [AssessmentStatus.Failed]: { label: 'Failed', tone: 'danger' },
};

/** Statuses considered "completed" — capturing one stamps submittedAt. */
export const ASSESSMENT_COMPLETED_STATUSES: readonly AssessmentStatus[] = [
  AssessmentStatus.Submitted,
  AssessmentStatus.Passed,
  AssessmentStatus.Failed,
];
