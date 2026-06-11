import { AuthSession } from '@core/models/auth.model';
import { User } from '@core/models/user.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { UserStatus } from '@core/enums/user-status.enum';

/** A demo user plus its (mock-only) password. */
export interface MockAuthUser extends User {
  password: string;
}

/**
 * Demo accounts for the mock auth backend. Passwords are intentionally simple
 * and shown on the login screen for prototype convenience. All use the same one.
 */
export const MOCK_DEMO_PASSWORD = 'Password123!';

export const MOCK_AUTH_USERS: readonly MockAuthUser[] = [
  {
    id: 1,
    uuid: 'a1f3c2d4-0001-4a10-9b21-1c0a7e5f1001',
    email: 'candidate@jobclick.dev',
    phone: '+95 9 770 000 001',
    fullName: 'Su Su Hlaing',
    status: UserStatus.Active,
    emailVerified: true,
    phoneVerified: true,
    roles: [RoleCode.Candidate],
    password: MOCK_DEMO_PASSWORD,
  },
  {
    id: 2,
    uuid: 'a1f3c2d4-0002-4a10-9b21-1c0a7e5f1002',
    email: 'recruiter@jobclick.dev',
    phone: '+95 9 770 000 002',
    fullName: 'Kyaw Zin Latt',
    status: UserStatus.Active,
    emailVerified: true,
    phoneVerified: true,
    roles: [RoleCode.Recruiter],
    companyId: 10,
    companyName: 'Greenline Technologies',
    password: MOCK_DEMO_PASSWORD,
  },
  {
    id: 3,
    uuid: 'a1f3c2d4-0003-4a10-9b21-1c0a7e5f1003',
    email: 'company.admin@jobclick.dev',
    phone: '+95 9 770 000 003',
    fullName: 'Nilar Win',
    status: UserStatus.Active,
    emailVerified: true,
    phoneVerified: true,
    roles: [RoleCode.CompanyAdmin],
    companyId: 10,
    companyName: 'Greenline Technologies',
    password: MOCK_DEMO_PASSWORD,
  },
  {
    id: 4,
    uuid: 'a1f3c2d4-0004-4a10-9b21-1c0a7e5f1004',
    email: 'platform.admin@jobclick.dev',
    phone: '+95 9 770 000 004',
    fullName: 'Aung Myo Thant',
    status: UserStatus.Active,
    emailVerified: true,
    phoneVerified: true,
    roles: [RoleCode.PlatformAdmin],
    password: MOCK_DEMO_PASSWORD,
  },
];

/** Builds a fake-but-realistically-shaped JWT session for a mock user. */
export function buildMockSession(mockUser: MockAuthUser): AuthSession {
  const { password: _password, ...user } = mockUser;
  const issuedAt = Date.now();
  const expiresAt = new Date(issuedAt + 60 * 60 * 1000).toISOString();
  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    iat: Math.floor(issuedAt / 1000),
  };
  const token = `mock.${encodeBase64Url(JSON.stringify(payload))}.signature`;

  return {
    token,
    refreshToken: `mock-refresh.${user.id}`,
    expiresAt,
    user: { ...user, lastLoginAt: new Date(issuedAt).toISOString() },
  };
}

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
