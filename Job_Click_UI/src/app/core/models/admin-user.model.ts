import { Id } from './common.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { UserStatus } from '@core/enums/user-status.enum';

/** A user as seen by the platform admin (USERS + USER_ROLES + resolved company). */
export interface AdminUser {
  id: Id;
  uuid: string;
  fullName: string;
  email: string;
  phone?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: RoleCode[];
  companyId?: Id;
  companyName?: string;
  createdAt: string;
  lastLoginAt?: string;
}

/** Query for the admin user list (search + filters + pagination). */
export interface AdminUserQuery {
  keyword?: string;
  role?: RoleCode;
  status?: UserStatus;
  page: number;
  pageSize: number;
}
