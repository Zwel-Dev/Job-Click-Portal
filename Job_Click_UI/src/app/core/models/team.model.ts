import { Id } from './common.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { MemberStatus } from '@core/enums/member-status.enum';

/** A company team member (USERS + USER_ROLES scoped by company_id). */
export interface TeamMember {
  userId: Id;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: RoleCode;
  status: MemberStatus;
  jobsOwned: number;
  invitedAt?: string;
  joinedAt?: string;
}

export interface InviteRequest {
  email: string;
  role: RoleCode;
}

export interface RoleChange {
  userId: Id;
  role: RoleCode;
}
