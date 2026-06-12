import { StatusTone } from './application-status.enum';

/** Company verification state (mirrors COMPANY_VERIFICATIONS.verification_status in the ERD). */
export enum VerificationStatus {
  Unverified = 'UNVERIFIED',
  Pending = 'PENDING',
  Verified = 'VERIFIED',
  Rejected = 'REJECTED',
}

export const VERIFICATION_STATUS_META: Record<VerificationStatus, { label: string; tone: StatusTone }> = {
  [VerificationStatus.Unverified]: { label: 'Not verified', tone: 'neutral' },
  [VerificationStatus.Pending]: { label: 'Under review', tone: 'progress' },
  [VerificationStatus.Verified]: { label: 'Verified', tone: 'success' },
  [VerificationStatus.Rejected]: { label: 'Rejected', tone: 'danger' },
};
