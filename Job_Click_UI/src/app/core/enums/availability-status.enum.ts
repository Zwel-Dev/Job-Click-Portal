/** Candidate availability (mirrors CANDIDATE_PROFILES.availability_status in the ERD). */
export enum AvailabilityStatus {
  OpenToWork = 'OPEN_TO_WORK',
  Employed = 'EMPLOYED',
  NotLooking = 'NOT_LOOKING',
}

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  [AvailabilityStatus.OpenToWork]: 'Open to work',
  [AvailabilityStatus.Employed]: 'Employed',
  [AvailabilityStatus.NotLooking]: 'Not looking',
};
