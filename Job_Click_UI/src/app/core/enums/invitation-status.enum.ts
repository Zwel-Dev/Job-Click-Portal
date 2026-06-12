import { StatusTone } from './application-status.enum';

/** Company invitation lifecycle (mirrors COMPANY_INVITATIONS.status in the ERD). */
export enum InvitationStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Revoked = 'REVOKED',
  Expired = 'EXPIRED',
}

export const INVITATION_STATUS_META: Record<InvitationStatus, { label: string; tone: StatusTone }> = {
  [InvitationStatus.Pending]: { label: 'Pending', tone: 'info' },
  [InvitationStatus.Accepted]: { label: 'Accepted', tone: 'success' },
  [InvitationStatus.Revoked]: { label: 'Revoked', tone: 'neutral' },
  [InvitationStatus.Expired]: { label: 'Expired', tone: 'neutral' },
};
