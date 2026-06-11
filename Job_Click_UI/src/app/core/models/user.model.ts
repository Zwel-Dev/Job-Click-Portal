import { RoleCode } from '@core/enums/role-code.enum';
import { UserStatus } from '@core/enums/user-status.enum';
import { Id } from './common.model';

/** A role assignment as returned with the authenticated user. */
export interface Role {
  id: Id;
  code: RoleCode;
  name: string;
}

/** Authenticated user (composed from USERS + USER_ROLES in the ERD). */
export interface User {
  id: Id;
  uuid: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: RoleCode[];
  /** Set when the user belongs to a company (employer workspace). */
  companyId?: Id;
  companyName?: string;
  lastLoginAt?: string;
}
