/** Account status (mirrors USERS.status in the ERD). */
export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Suspended = 'SUSPENDED',
  PendingVerification = 'PENDING_VERIFICATION',
}
