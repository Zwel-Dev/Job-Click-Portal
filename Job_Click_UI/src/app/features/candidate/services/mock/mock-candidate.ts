import {
  CandidateCertification,
  CandidateEducation,
  CandidateExperience,
  CandidatePortfolio,
  CandidateProfile,
  CandidateSkill,
} from '@core/models/candidate.model';
import { EmploymentType } from '@core/enums/employment-type.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { AvailabilityStatus } from '@core/enums/availability-status.enum';
import { ProfileVisibility } from '@core/enums/profile-visibility.enum';
import { ProficiencyLevel } from '@core/enums/proficiency-level.enum';
import { PortfolioPlatform } from '@core/enums/portfolio-platform.enum';

/** The signed-in demo candidate (matches `candidate@jobclick.dev` from the auth mock users). */
export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  id: 1,
  userId: 1,
  fullName: 'Su Su Hlaing',
  email: 'candidate@jobclick.dev',
  phone: '+95 9 770 000 001',
  dateOfBirth: '1996-04-12',
  gender: 'Female',
  nationality: 'Myanmar',
  address: 'Yangon, Myanmar',
  headline: 'Frontend Developer (Angular)',
  summary:
    'Frontend developer with 4 years of experience building responsive Angular ' +
    'applications and design systems for fintech and e-commerce products.',
  careerObjective: 'Grow into a senior frontend role on a product-focused team.',
  preferredJobTitles: ['Frontend Developer', 'Angular Developer'],
  preferredLocations: ['Yangon', 'Remote'],
  employmentTypes: [EmploymentType.FullTime],
  workMode: WorkMode.Hybrid,
  expectedSalary: 1_800_000,
  currency: 'MMK',
  availabilityStatus: AvailabilityStatus.OpenToWork,
  profileVisibility: ProfileVisibility.RecruitersOnly,
  profileCompletion: 90,
  updatedAt: '2026-05-20T08:00:00Z',
};

export const MOCK_SKILLS: CandidateSkill[] = [
  { id: 101, skillId: 1, name: 'Angular', category: 'Frontend', proficiency: ProficiencyLevel.Advanced, yearsExperience: 4 },
  { id: 102, skillId: 2, name: 'TypeScript', category: 'Language', proficiency: ProficiencyLevel.Advanced, yearsExperience: 4 },
  { id: 103, skillId: 3, name: 'RxJS', category: 'Frontend', proficiency: ProficiencyLevel.Intermediate, yearsExperience: 3 },
  { id: 104, skillId: 4, name: 'SCSS', category: 'Frontend', proficiency: ProficiencyLevel.Advanced, yearsExperience: 4 },
  { id: 105, skillId: 5, name: 'Git', category: 'Tools', proficiency: ProficiencyLevel.Advanced, yearsExperience: 4 },
];

export const MOCK_EXPERIENCES: CandidateExperience[] = [
  {
    id: 201,
    companyName: 'Greenline Technologies',
    jobTitle: 'Frontend Developer',
    startDate: '2023-01-01',
    currentJob: true,
    responsibilities: 'Build and maintain Angular applications and the internal component library.',
    achievements: 'Reduced average page load time by 35% and led the design-system migration.',
  },
  {
    id: 202,
    companyName: 'Yangon Digital',
    jobTitle: 'Junior Web Developer',
    startDate: '2021-06-01',
    endDate: '2022-12-31',
    currentJob: false,
    responsibilities: 'Developed responsive marketing websites and landing pages.',
  },
];

export const MOCK_EDUCATIONS: CandidateEducation[] = [
  {
    id: 301,
    institution: 'University of Computer Studies, Yangon',
    degree: 'Bachelor of Computer Science',
    major: 'Software Engineering',
    gpa: 3.6,
    graduationYear: 2020,
  },
];

export const MOCK_CERTIFICATIONS: CandidateCertification[] = [
  {
    id: 401,
    certificationName: 'Professional Scrum Master I',
    issuer: 'Scrum.org',
    issueDate: '2023-03-01',
  },
];

export const MOCK_PORTFOLIOS: CandidatePortfolio[] = [
  { id: 501, platform: PortfolioPlatform.LinkedIn, url: 'https://www.linkedin.com/in/susu-hlaing' },
  { id: 502, platform: PortfolioPlatform.GitHub, url: 'https://github.com/susu-hlaing' },
];
