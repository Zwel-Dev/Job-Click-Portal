import { JobSummary } from '@core/models/job.model';
import { EmploymentType } from '@core/enums/employment-type.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { SeniorityLevel } from '@core/enums/seniority-level.enum';

/** Shared job catalogue used across dashboard, search, and detail (mock backend). */
export const MOCK_JOB_SUMMARIES: JobSummary[] = [
  {
    id: 1, title: 'Senior Frontend Developer', companyId: 10, companyName: 'Greenline Technologies',
    industry: 'Information Technology', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Senior,
    salaryMin: 2_500_000, salaryMax: 3_500_000, currency: 'MMK', publishedAt: '2026-06-08T09:00:00Z',
  },
  {
    id: 2, title: 'Angular Developer', companyId: 12, companyName: 'Yangon Digital',
    industry: 'Software & Internet', location: 'Remote',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Remote, seniorityLevel: SeniorityLevel.Mid,
    salaryMin: 1_800_000, salaryMax: 2_600_000, currency: 'MMK', publishedAt: '2026-06-07T09:00:00Z',
  },
  {
    id: 3, title: 'Full Stack Engineer', companyId: 13, companyName: 'Mandalay Fintech',
    industry: 'Banking & Financial Services', location: 'Mandalay, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Onsite, seniorityLevel: SeniorityLevel.Mid,
    salaryMin: 2_000_000, salaryMax: 3_000_000, currency: 'MMK', publishedAt: '2026-06-06T09:00:00Z',
  },
  {
    id: 4, title: 'UI/UX Designer', companyId: 15, companyName: 'Frontiir',
    industry: 'Telecommunications', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Mid,
    salaryMin: 1_600_000, salaryMax: 2_400_000, currency: 'MMK', publishedAt: '2026-06-05T09:00:00Z',
  },
  {
    id: 5, title: 'DevOps Engineer', companyId: 10, companyName: 'Greenline Technologies',
    industry: 'Information Technology', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Senior,
    salaryMin: 2_800_000, salaryMax: 4_000_000, currency: 'MMK', publishedAt: '2026-06-04T09:00:00Z',
  },
  {
    id: 6, title: 'Backend Developer (Node.js)', companyId: 16, companyName: 'Wave Money',
    industry: 'Banking & Financial Services', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Onsite, seniorityLevel: SeniorityLevel.Mid,
    salaryMin: 2_200_000, salaryMax: 3_200_000, currency: 'MMK', publishedAt: '2026-06-03T09:00:00Z',
  },
  {
    id: 7, title: 'Junior Web Developer', companyId: 12, companyName: 'Yangon Digital',
    industry: 'Software & Internet', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Onsite, seniorityLevel: SeniorityLevel.Junior,
    salaryMin: 900_000, salaryMax: 1_400_000, currency: 'MMK', publishedAt: '2026-06-02T09:00:00Z',
  },
  {
    id: 8, title: 'Product Manager', companyId: 14, companyName: 'KBZ Bank',
    industry: 'Banking & Financial Services', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Lead,
    salaryMin: 3_500_000, salaryMax: 5_000_000, currency: 'MMK', publishedAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 9, title: 'Data Analyst', companyId: 13, companyName: 'Mandalay Fintech',
    industry: 'Banking & Financial Services', location: 'Remote',
    employmentType: EmploymentType.Contract, workMode: WorkMode.Remote, seniorityLevel: SeniorityLevel.Mid,
    salaryMin: 1_800_000, salaryMax: 2_500_000, currency: 'MMK', publishedAt: '2026-05-30T09:00:00Z',
  },
  {
    id: 10, title: 'QA Engineer', companyId: 15, companyName: 'Frontiir',
    industry: 'Telecommunications', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Onsite, seniorityLevel: SeniorityLevel.Mid,
    salaryMin: 1_500_000, salaryMax: 2_200_000, currency: 'MMK', publishedAt: '2026-05-28T09:00:00Z',
  },
  {
    id: 11, title: 'Mobile Developer (Flutter)', companyId: 11, companyName: 'Ayeyar Hinthar',
    industry: 'Retail & E-commerce', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Mid,
    salaryMin: 2_000_000, salaryMax: 3_000_000, currency: 'MMK', publishedAt: '2026-05-26T09:00:00Z',
  },
  {
    id: 12, title: 'Frontend Intern', companyId: 10, companyName: 'Greenline Technologies',
    industry: 'Information Technology', location: 'Yangon, Myanmar',
    employmentType: EmploymentType.Internship, workMode: WorkMode.Onsite, seniorityLevel: SeniorityLevel.Entry,
    salaryMin: 400_000, salaryMax: 600_000, currency: 'MMK', publishedAt: '2026-05-24T09:00:00Z',
  },
];

export function findMockJob(id: number): JobSummary | undefined {
  return MOCK_JOB_SUMMARIES.find((job) => job.id === id);
}
