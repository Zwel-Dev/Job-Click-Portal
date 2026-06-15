import { SubscriptionPlan } from '@core/models/subscription.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { roleLabel } from '@core/utils/role-label';
import { FeatureFlag, RoleInfo, Skill } from '../../models/platform-settings.model';

/** Read-only role reference for the Roles tab. */
export const ROLE_INFO: readonly RoleInfo[] = [
  { code: RoleCode.PlatformAdmin, label: roleLabel(RoleCode.PlatformAdmin), description: 'Full operator access to the platform console — users, companies, verification, moderation, and settings.' },
  { code: RoleCode.CompanyAdmin, label: roleLabel(RoleCode.CompanyAdmin), description: 'Manages a company: profile, team, locations, verification, and subscription.' },
  { code: RoleCode.RecruitmentManager, label: roleLabel(RoleCode.RecruitmentManager), description: 'Approves jobs and oversees the hiring pipeline across recruiters.' },
  { code: RoleCode.Recruiter, label: roleLabel(RoleCode.Recruiter), description: 'Posts jobs, screens applicants, and moves candidates through the pipeline.' },
  { code: RoleCode.HiringManager, label: roleLabel(RoleCode.HiringManager), description: 'Reviews shortlisted candidates and gives hiring decisions.' },
  { code: RoleCode.Candidate, label: roleLabel(RoleCode.Candidate), description: 'Job seeker — builds a profile, applies to jobs, and tracks applications.' },
];

/** Skills taxonomy seed (a slice of the catalog, with categories). */
export const MOCK_SKILLS: readonly Skill[] = [
  { id: 1, name: 'Angular', category: 'Frontend' },
  { id: 2, name: 'React', category: 'Frontend' },
  { id: 3, name: 'TypeScript', category: 'Languages' },
  { id: 4, name: 'JavaScript', category: 'Languages' },
  { id: 5, name: 'Node.js', category: 'Backend' },
  { id: 6, name: 'NestJS', category: 'Backend' },
  { id: 7, name: 'Java', category: 'Languages' },
  { id: 8, name: 'Spring Boot', category: 'Backend' },
  { id: 9, name: 'Python', category: 'Languages' },
  { id: 10, name: 'PostgreSQL', category: 'Databases' },
  { id: 11, name: 'MongoDB', category: 'Databases' },
  { id: 12, name: 'Docker', category: 'DevOps' },
  { id: 13, name: 'AWS', category: 'Cloud' },
  { id: 14, name: 'Figma', category: 'Design' },
  { id: 15, name: 'Project Management', category: 'Business' },
];

/** Plan catalog seed (matches the company-admin catalog). */
export const MOCK_SETTINGS_PLANS: readonly SubscriptionPlan[] = [
  { id: 1, name: 'Free', price: 0, currency: 'USD', maxJobs: 3, maxRecruiters: 1, candidateSearch: false, features: ['Up to 3 active jobs', '1 recruiter', 'Applicant pipeline', 'Email support'] },
  { id: 2, name: 'Pro', price: 199, currency: 'USD', maxJobs: 20, maxRecruiters: 5, candidateSearch: true, features: ['Up to 20 active jobs', 'Up to 5 recruiters', 'Candidate search & talent pools', 'Recruitment analytics'] },
  { id: 3, name: 'Enterprise', price: 499, currency: 'USD', maxJobs: 999, maxRecruiters: 999, candidateSearch: true, features: ['Unlimited jobs', 'Unlimited recruiters', 'Advanced analytics', 'SSO & audit log', 'Priority support'] },
];

/** Feature flags seed. */
export const MOCK_FEATURE_FLAGS: readonly FeatureFlag[] = [
  { id: 1, key: 'public_profiles', label: 'Public candidate profiles', description: 'Let candidates make their profile visible to all employers.', enabled: true },
  { id: 2, key: 'talent_pools', label: 'Talent pools', description: 'Recruiters can save candidates into reusable pools.', enabled: true },
  { id: 3, key: 'ai_matching', label: 'AI job matching', description: 'Surface AI-ranked candidate/job recommendations.', enabled: false },
  { id: 4, key: 'candidate_search', label: 'Recruiter candidate search', description: 'Allow recruiters to proactively search the candidate database.', enabled: true },
  { id: 5, key: 'self_signup', label: 'Company self-service signup', description: 'New companies can register without an invite.', enabled: true },
];
