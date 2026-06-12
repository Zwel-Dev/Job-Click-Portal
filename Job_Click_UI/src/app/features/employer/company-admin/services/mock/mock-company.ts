import { Company, CompanyLocation, CompanyVerification, Department } from '@core/models/company.model';
import { PlanUsage, SubscriptionPlan } from '@core/models/subscription.model';
import { CompanyStatus } from '@core/enums/company-status.enum';
import { CompanySize } from '@core/enums/company-size.enum';
import { VerificationStatus } from '@core/enums/verification-status.enum';

/** The demo company — Greenline Technologies (company 10), the recruiter's employer. */
export const MOCK_COMPANY: Company = {
  id: 10,
  companyCode: 'GLT-0010',
  name: 'Greenline Technologies',
  logoUrl: undefined,
  website: 'https://greenline.example.com',
  industry: 'Information Technology',
  companySize: CompanySize.Medium,
  description:
    'Greenline Technologies builds enterprise software for businesses across Myanmar. ' +
    'We focus on clean engineering, product quality, and continuous learning.',
  status: CompanyStatus.Active,
  verified: false,
  createdAt: '2024-01-15T09:00:00Z',
  updatedAt: '2026-06-01T09:00:00Z',
};

/** Starts Unverified so the verification flow (submit → pending) is demoable. */
export const MOCK_COMPANY_VERIFICATION: CompanyVerification = {
  id: 1,
  status: VerificationStatus.Unverified,
  documents: [],
};

export const MOCK_PLAN: SubscriptionPlan = {
  id: 2,
  name: 'Pro',
  price: 199,
  currency: 'USD',
  maxJobs: 20,
  maxRecruiters: 5,
  candidateSearch: true,
  features: ['Up to 20 active jobs', 'Up to 5 recruiters', 'Candidate search & talent pools', 'Recruitment analytics'],
};

export const MOCK_PLAN_USAGE: PlanUsage = {
  jobsUsed: 8,
  jobsLimit: 20,
  recruitersUsed: 3,
  recruitersLimit: 5,
};

export const MOCK_COMPANY_LOCATIONS: CompanyLocation[] = [
  { id: 1, country: 'Myanmar', state: 'Yangon Region', city: 'Yangon', address: 'No. 12, Pyay Road, Hlaing Township', postalCode: '11051', isHeadOffice: true },
  { id: 2, country: 'Myanmar', state: 'Mandalay Region', city: 'Mandalay', address: '78th Street, between 30th & 31st', postalCode: '05021', isHeadOffice: false },
  { id: 3, country: 'Myanmar', city: 'Remote', isHeadOffice: false },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Engineering', description: 'Software engineering and platform teams.', jobCount: 4 },
  { id: 2, name: 'Design', description: 'Product and brand design.', jobCount: 1 },
  { id: 3, name: 'Product', description: 'Product management and delivery.', jobCount: 1 },
  { id: 4, name: 'Data & Analytics', description: 'Data engineering, analytics, and BI.', jobCount: 2 },
  { id: 5, name: 'Quality Assurance', description: 'QA and test automation.', jobCount: 0 },
];

/** Overview member count for Greenline; departments + locations are computed live. */
export const MOCK_COMPANY_COUNTS = { members: 5 };
