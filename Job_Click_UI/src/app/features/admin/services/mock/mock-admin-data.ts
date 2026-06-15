import { AdminUser } from '@core/models/admin-user.model';
import { AdminCompany, AdminCompanyDetail } from '@core/models/admin-company.model';
import { CompanyLocation } from '@core/models/company.model';
import { FraudSignal, SystemKpis } from '@core/models/admin-platform.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { UserStatus } from '@core/enums/user-status.enum';
import { CompanyStatus } from '@core/enums/company-status.enum';
import { CompanySize } from '@core/enums/company-size.enum';
import { VerificationStatus } from '@core/enums/verification-status.enum';
import { FraudSignalType } from '@core/enums/fraud-signal-type.enum';
import { FraudSeverity } from '@core/enums/fraud-severity.enum';

/**
 * Platform-wide demo dataset for the admin workspace. Spans several companies
 * and users so the operator console has real work to show (queues, signals).
 * The KPI strip aggregates are partly hand-set to platform-scale numbers; the
 * queue counts (verifications, fraud) are derived from the lists below so the
 * dashboard and nav badges always agree.
 */

/** Cross-resolves the four shipped demo accounts (ids 1–4) plus a wider cohort. */
export const MOCK_ADMIN_USERS: readonly AdminUser[] = [
  {
    id: 1, uuid: 'a1f3c2d4-0001-4a10-9b21-1c0a7e5f1001', fullName: 'Su Su Hlaing',
    email: 'candidate@jobclick.dev', phone: '+95 9 770 000 001', status: UserStatus.Active,
    emailVerified: true, phoneVerified: true, roles: [RoleCode.Candidate],
    createdAt: '2025-11-02T09:00:00Z', lastLoginAt: '2026-06-14T02:15:00Z',
  },
  {
    id: 2, uuid: 'a1f3c2d4-0002-4a10-9b21-1c0a7e5f1002', fullName: 'Kyaw Zin Latt',
    email: 'recruiter@jobclick.dev', phone: '+95 9 770 000 002', status: UserStatus.Active,
    emailVerified: true, phoneVerified: true, roles: [RoleCode.Recruiter],
    companyId: 10, companyName: 'Greenline Technologies',
    createdAt: '2025-09-18T09:00:00Z', lastLoginAt: '2026-06-13T08:40:00Z',
  },
  {
    id: 3, uuid: 'a1f3c2d4-0003-4a10-9b21-1c0a7e5f1003', fullName: 'Nilar Win',
    email: 'company.admin@jobclick.dev', phone: '+95 9 770 000 003', status: UserStatus.Active,
    emailVerified: true, phoneVerified: true, roles: [RoleCode.CompanyAdmin],
    companyId: 10, companyName: 'Greenline Technologies',
    createdAt: '2025-09-18T09:00:00Z', lastLoginAt: '2026-06-15T01:05:00Z',
  },
  {
    id: 4, uuid: 'a1f3c2d4-0004-4a10-9b21-1c0a7e5f1004', fullName: 'Aung Myo Thant',
    email: 'platform.admin@jobclick.dev', phone: '+95 9 770 000 004', status: UserStatus.Active,
    emailVerified: true, phoneVerified: true, roles: [RoleCode.PlatformAdmin],
    createdAt: '2025-01-10T09:00:00Z', lastLoginAt: '2026-06-15T03:20:00Z',
  },
  {
    id: 5, uuid: 'a1f3c2d4-0005-4a10-9b21-1c0a7e5f1005', fullName: 'Thandar Aye',
    email: 'thandar.aye@brightpath.example', status: UserStatus.Active,
    emailVerified: true, phoneVerified: false, roles: [RoleCode.CompanyAdmin],
    companyId: 11, companyName: 'BrightPath Solutions',
    createdAt: '2026-05-28T09:00:00Z', lastLoginAt: '2026-06-12T10:00:00Z',
  },
  {
    id: 6, uuid: 'a1f3c2d4-0006-4a10-9b21-1c0a7e5f1006', fullName: 'Min Khant Kyaw',
    email: 'min.khant@bluewave.example', status: UserStatus.Active,
    emailVerified: true, phoneVerified: true, roles: [RoleCode.RecruitmentManager],
    companyId: 12, companyName: 'BlueWave Logistics',
    createdAt: '2026-06-10T09:00:00Z', lastLoginAt: '2026-06-14T06:30:00Z',
  },
  {
    id: 7, uuid: 'a1f3c2d4-0007-4a10-9b21-1c0a7e5f1007', fullName: 'Ei Ei Phyo',
    email: 'eiei.phyo@gmail.example', status: UserStatus.Active,
    emailVerified: true, phoneVerified: false, roles: [RoleCode.Candidate],
    createdAt: '2026-06-13T09:00:00Z', lastLoginAt: '2026-06-14T12:00:00Z',
  },
  {
    id: 8, uuid: 'a1f3c2d4-0008-4a10-9b21-1c0a7e5f1008', fullName: 'Zaw Lin Htet',
    email: 'zaw.lin@outlook.example', status: UserStatus.PendingVerification,
    emailVerified: false, phoneVerified: false, roles: [RoleCode.Candidate],
    createdAt: '2026-06-14T09:00:00Z',
  },
  {
    id: 9, uuid: 'a1f3c2d4-0009-4a10-9b21-1c0a7e5f1009', fullName: 'Hnin Wai Yan',
    email: 'hnin.wy@brightpath.example', status: UserStatus.Active,
    emailVerified: true, phoneVerified: true, roles: [RoleCode.Recruiter],
    companyId: 11, companyName: 'BrightPath Solutions',
    createdAt: '2026-06-09T09:00:00Z', lastLoginAt: '2026-06-13T09:15:00Z',
  },
  {
    id: 10, uuid: 'a1f3c2d4-0010-4a10-9b21-1c0a7e5f1010', fullName: 'Wai Yan Moe',
    email: 'wai.yan@swiftmart.example', status: UserStatus.Suspended,
    emailVerified: true, phoneVerified: false, roles: [RoleCode.CompanyAdmin],
    companyId: 14, companyName: 'SwiftMart Retail',
    createdAt: '2026-03-22T09:00:00Z', lastLoginAt: '2026-05-30T07:45:00Z',
  },
  {
    id: 11, uuid: 'a1f3c2d4-0011-4a10-9b21-1c0a7e5f1011', fullName: 'Khin Myat Noe',
    email: 'khin.myat@gmail.example', status: UserStatus.Active,
    emailVerified: true, phoneVerified: true, roles: [RoleCode.Candidate],
    createdAt: '2026-06-12T09:00:00Z', lastLoginAt: '2026-06-15T00:10:00Z',
  },
  {
    id: 12, uuid: 'a1f3c2d4-0012-4a10-9b21-1c0a7e5f1012', fullName: 'Aye Chan Moe',
    email: 'aye.chan@bluewave.example', status: UserStatus.Active,
    emailVerified: true, phoneVerified: true, roles: [RoleCode.HiringManager],
    companyId: 12, companyName: 'BlueWave Logistics',
    createdAt: '2026-04-05T09:00:00Z', lastLoginAt: '2026-06-11T14:20:00Z',
  },
  {
    id: 13, uuid: 'a1f3c2d4-0013-4a10-9b21-1c0a7e5f1013', fullName: 'Pyae Sone Aung',
    email: 'pyae.sone@apexfinance.example', status: UserStatus.Active,
    emailVerified: true, phoneVerified: false, roles: [RoleCode.CompanyAdmin],
    companyId: 13, companyName: 'Apex Finance Group',
    createdAt: '2026-06-11T09:00:00Z', lastLoginAt: '2026-06-12T05:00:00Z',
  },
  {
    id: 14, uuid: 'a1f3c2d4-0014-4a10-9b21-1c0a7e5f1014', fullName: 'Su Myat Mon',
    email: 'su.myat@gmail.example', status: UserStatus.Active,
    emailVerified: false, phoneVerified: false, roles: [RoleCode.Candidate],
    createdAt: '2026-06-15T02:00:00Z',
  },
];

/** ~7 companies with mixed status / verified / plan; 3 currently Pending review. */
export const MOCK_ADMIN_COMPANIES: readonly AdminCompany[] = [
  {
    id: 10, name: 'Greenline Technologies', companyCode: 'GLT-0010', status: CompanyStatus.Active,
    verified: false, verificationStatus: VerificationStatus.Unverified, industry: 'Information Technology',
    companySize: CompanySize.Medium, planName: 'Pro', jobsCount: 8, membersCount: 5,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 11, name: 'BrightPath Solutions', companyCode: 'BPS-0011', status: CompanyStatus.Active,
    verified: true, verificationStatus: VerificationStatus.Verified, industry: 'Consulting',
    companySize: CompanySize.Small, planName: 'Pro', jobsCount: 4, membersCount: 3,
    createdAt: '2025-08-03T09:00:00Z',
  },
  {
    id: 12, name: 'BlueWave Logistics', companyCode: 'BWL-0012', status: CompanyStatus.Active,
    verified: true, verificationStatus: VerificationStatus.Verified, industry: 'Logistics & Supply Chain',
    companySize: CompanySize.Large, planName: 'Enterprise', jobsCount: 12, membersCount: 9,
    createdAt: '2025-02-20T09:00:00Z',
  },
  {
    id: 13, name: 'Apex Finance Group', companyCode: 'AFG-0013', status: CompanyStatus.Active,
    verified: false, verificationStatus: VerificationStatus.Pending, industry: 'Financial Services',
    companySize: CompanySize.Medium, planName: 'Free', jobsCount: 2, membersCount: 2,
    createdAt: '2026-06-08T09:00:00Z',
  },
  {
    id: 14, name: 'SwiftMart Retail', companyCode: 'SMR-0014', status: CompanyStatus.Suspended,
    verified: false, verificationStatus: VerificationStatus.Rejected, industry: 'Retail',
    companySize: CompanySize.Small, planName: 'Free', jobsCount: 0, membersCount: 1,
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 15, name: 'Horizon Media House', companyCode: 'HMH-0015', status: CompanyStatus.Active,
    verified: true, verificationStatus: VerificationStatus.Verified, industry: 'Media & Advertising',
    companySize: CompanySize.Medium, planName: 'Pro', jobsCount: 6, membersCount: 4,
    createdAt: '2025-12-12T09:00:00Z',
  },
  {
    id: 16, name: 'Quantum Health Labs', companyCode: 'QHL-0016', status: CompanyStatus.Active,
    verified: false, verificationStatus: VerificationStatus.Pending, industry: 'Healthcare',
    companySize: CompanySize.Large, planName: 'Pro', jobsCount: 3, membersCount: 6,
    createdAt: '2026-06-04T09:00:00Z',
  },
];

/** Per-company website + office locations surfaced on the admin company-detail page. */
const COMPANY_WEBSITES: Record<number, string> = {
  10: 'https://greenline.example.com',
  11: 'https://brightpath.example',
  12: 'https://bluewave.example',
  15: 'https://horizonmedia.example',
};

const COMPANY_LOCATIONS: Record<number, CompanyLocation[]> = {
  10: [
    { id: 1, country: 'Myanmar', state: 'Yangon Region', city: 'Yangon', address: 'No. 12, Pyay Road, Hlaing Township', postalCode: '11051', isHeadOffice: true },
    { id: 2, country: 'Myanmar', state: 'Mandalay Region', city: 'Mandalay', address: '78th Street, between 30th & 31st', postalCode: '05021', isHeadOffice: false },
  ],
  11: [
    { id: 3, country: 'Myanmar', state: 'Yangon Region', city: 'Yangon', address: 'Sule Square, Level 8', postalCode: '11181', isHeadOffice: true },
  ],
  12: [
    { id: 4, country: 'Myanmar', state: 'Yangon Region', city: 'Yangon', address: 'Thilawa SEZ, Zone B', isHeadOffice: true },
    { id: 5, country: 'Singapore', city: 'Singapore', address: '1 Raffles Place', postalCode: '048616', isHeadOffice: false },
  ],
  15: [
    { id: 6, country: 'Myanmar', state: 'Yangon Region', city: 'Yangon', address: 'Junction City Tower, Level 22', isHeadOffice: true },
  ],
};

/** Builds the expanded detail for a company: website, locations, and its admins. */
export function buildAdminCompanyDetail(company: AdminCompany): AdminCompanyDetail {
  const admins = MOCK_ADMIN_USERS.filter(
    (user) => user.companyId === company.id && user.roles.includes(RoleCode.CompanyAdmin),
  ).map((user) => ({ fullName: user.fullName, email: user.email }));

  return {
    ...company,
    website: COMPANY_WEBSITES[company.id],
    locations: COMPANY_LOCATIONS[company.id] ?? [],
    admins,
  };
}

/** ~6 integrity signals across types/severities; entity refs map to real mock data. */
export const MOCK_FRAUD_SIGNALS: readonly FraudSignal[] = [
  {
    id: 1, type: FraudSignalType.FakeCompany, severity: FraudSeverity.High,
    entityLabel: 'SwiftMart Retail', detail: 'Registration number does not match any government record.',
    detectedAt: '2026-06-14T18:00:00Z', resolved: false, entityType: 'company', entityId: 14,
  },
  {
    id: 2, type: FraudSignalType.ScamJob, severity: FraudSeverity.High,
    entityLabel: 'Job #9 — "Work-from-home data entry"', detail: 'Requests an upfront payment from applicants.',
    detectedAt: '2026-06-14T11:20:00Z', resolved: false, entityType: 'job', entityId: 9,
  },
  {
    id: 3, type: FraudSignalType.DuplicateJob, severity: FraudSeverity.Medium,
    entityLabel: 'Job #20 ↔ #5 (Greenline)', detail: 'Two near-identical postings within the same company.',
    detectedAt: '2026-06-13T09:05:00Z', resolved: false, entityType: 'job', entityId: 20,
  },
  {
    id: 4, type: FraudSignalType.SpamApplications, severity: FraudSeverity.Medium,
    entityLabel: 'Candidate su.myat@gmail.example', detail: '38 applications submitted in under an hour.',
    detectedAt: '2026-06-15T02:40:00Z', resolved: false, entityType: 'user', entityId: 14,
  },
  {
    id: 5, type: FraudSignalType.SuspiciousLogin, severity: FraudSeverity.Low,
    entityLabel: 'wai.yan@swiftmart.example', detail: 'Sign-in attempts from three countries in 10 minutes.',
    detectedAt: '2026-06-12T22:15:00Z', resolved: true, resolvedBy: 'Aung Myo Thant', entityType: 'user', entityId: 10,
  },
  {
    id: 6, type: FraudSignalType.FakeCompany, severity: FraudSeverity.Low,
    entityLabel: 'Northwind Traders', detail: 'Logo reused from an unrelated brand; flagged for review.',
    detectedAt: '2026-06-10T13:30:00Z', resolved: true, resolvedBy: 'Aung Myo Thant',
  },
];

/**
 * Builds the platform KPI snapshot. `pendingVerifications` and `openFraudSignals`
 * are passed in from their owning services (`VerificationStore` / `FraudService`)
 * so the dashboard, nav badges, and underlying queues stay in lockstep.
 */
export function buildSystemKpis(pendingVerifications: number, openFraudSignals: number): SystemKpis {
  return {
    totalUsers: 1284,
    candidates: 1108,
    companies: MOCK_ADMIN_COMPANIES.length,
    activeJobs: 64,
    pendingVerifications,
    openFraudSignals,
    applicationsToday: 41,
  };
}
