import { StatusTone } from './application-status.enum';

/** Account status (mirrors USERS.status in the ERD). */
export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Suspended = 'SUSPENDED',
  PendingVerification = 'PENDING_VERIFICATION',
}

export const USER_STATUS_META: Record<UserStatus, { label: string; tone: StatusTone }> = {
  [UserStatus.Active]: { label: 'Active', tone: 'success' },
  [UserStatus.Inactive]: { label: 'Inactive', tone: 'neutral' },
  [UserStatus.Suspended]: { label: 'Suspended', tone: 'danger' },
  [UserStatus.PendingVerification]: { label: 'Pending', tone: 'progress' },
};
