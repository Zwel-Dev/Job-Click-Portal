/** Application lifecycle (mirrors APPLICATIONS.application_status in the ERD). */
export enum ApplicationStatus {
  Applied = 'APPLIED',
  Viewed = 'VIEWED',
  Screening = 'SCREENING',
  Shortlisted = 'SHORTLISTED',
  Interview = 'INTERVIEW',
  Offer = 'OFFER',
  Hired = 'HIRED',
  Rejected = 'REJECTED',
  Withdrawn = 'WITHDRAWN',
}

/** Visual tone used by status chips/badges (maps to design-system colors). */
export type StatusTone = 'neutral' | 'info' | 'progress' | 'success' | 'danger';

export const APPLICATION_STATUS_META: Record<ApplicationStatus, { label: string; tone: StatusTone }> = {
  [ApplicationStatus.Applied]: { label: 'Applied', tone: 'neutral' },
  [ApplicationStatus.Viewed]: { label: 'Viewed', tone: 'info' },
  [ApplicationStatus.Screening]: { label: 'Screening', tone: 'progress' },
  [ApplicationStatus.Shortlisted]: { label: 'Shortlisted', tone: 'progress' },
  [ApplicationStatus.Interview]: { label: 'Interview', tone: 'progress' },
  [ApplicationStatus.Offer]: { label: 'Offer', tone: 'success' },
  [ApplicationStatus.Hired]: { label: 'Hired', tone: 'success' },
  [ApplicationStatus.Rejected]: { label: 'Rejected', tone: 'danger' },
  [ApplicationStatus.Withdrawn]: { label: 'Withdrawn', tone: 'neutral' },
};

/** The forward pipeline (excludes terminal Rejected/Withdrawn) for the tracker. */
export const APPLICATION_PIPELINE: readonly ApplicationStatus[] = [
  ApplicationStatus.Applied,
  ApplicationStatus.Viewed,
  ApplicationStatus.Screening,
  ApplicationStatus.Shortlisted,
  ApplicationStatus.Interview,
  ApplicationStatus.Offer,
  ApplicationStatus.Hired,
];
