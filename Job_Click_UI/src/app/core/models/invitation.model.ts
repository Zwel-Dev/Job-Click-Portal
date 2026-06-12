import { Id } from './common.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { InvitationStatus } from '@core/enums/invitation-status.enum';

/** An email-keyed offer of a company membership (mirrors COMPANY_INVITATIONS). */
export interface Invitation {
  id: Id;
  companyId: Id;
  companyName: string;
  email: string;
  role: RoleCode;
  /** Single-use token carried in the accept link. */
  token: string;
  status: InvitationStatus;
  invitedBy: Id;
  invitedByName: string;
  acceptedUserId?: Id;
  expiresAt: string;
  createdAt: string;
}

/** What the accept page resolves a token to (before the recipient acts). */
export interface InvitationPreview {
  companyName: string;
  role: RoleCode;
  email: string;
  /** true → register-via-invite; false → add-role to an existing account. */
  needsAccount: boolean;
  valid: boolean;
  reason?: 'expired' | 'revoked' | 'accepted' | 'not_found';
}

export interface AcceptInviteInput {
  fullName: string;
  password: string;
}
