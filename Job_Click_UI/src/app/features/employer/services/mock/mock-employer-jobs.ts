import { EmployerJob } from '../../models/employer-job.model';
import { EmploymentType } from '@core/enums/employment-type.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { SeniorityLevel } from '@core/enums/seniority-level.enum';
import { JobStatus } from '@core/enums/job-status.enum';
import { JobApprovalStage } from '@core/enums/job-approval-stage.enum';

/**
 * Jobs for the demo company (Greenline Technologies, company 10). Owner 2 is the
 * signed-in recruiter (`recruiter@jobclick.dev`); owner 5 is a teammate.
 */
export const MOCK_EMPLOYER_JOBS: EmployerJob[] = [
  {
    id: 301, title: 'Senior Frontend Developer', status: JobStatus.Published,
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Senior,
    location: 'Yangon, Myanmar', salaryMin: 2_500_000, salaryMax: 3_500_000, currency: 'MMK',
    applicantCount: 18, ownerId: 2, ownerName: 'Kyaw Zin Latt',
    createdAt: '2026-05-20T09:00:00Z', publishedAt: '2026-06-08T09:00:00Z', expiredAt: '2026-07-08T09:00:00Z',
  },
  {
    id: 302, title: 'DevOps Engineer', status: JobStatus.Published,
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Senior,
    location: 'Yangon, Myanmar', salaryMin: 2_800_000, salaryMax: 4_000_000, currency: 'MMK',
    applicantCount: 9, ownerId: 2, ownerName: 'Kyaw Zin Latt',
    createdAt: '2026-05-28T09:00:00Z', publishedAt: '2026-06-04T09:00:00Z',
  },
  {
    id: 303, title: 'Backend Developer (Java)', status: JobStatus.Paused,
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Onsite, seniorityLevel: SeniorityLevel.Mid,
    location: 'Yangon, Myanmar', salaryMin: 2_000_000, salaryMax: 3_000_000, currency: 'MMK',
    applicantCount: 12, ownerId: 5, ownerName: 'Thiri Aung',
    createdAt: '2026-05-10T09:00:00Z', publishedAt: '2026-05-15T09:00:00Z',
  },
  {
    id: 304, title: 'Product Designer', status: JobStatus.PendingApproval, approvalStage: JobApprovalStage.PendingManager,
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Mid,
    location: 'Yangon, Myanmar', salaryMin: 1_800_000, salaryMax: 2_600_000, currency: 'MMK',
    applicantCount: 0, ownerId: 2, ownerName: 'Kyaw Zin Latt',
    createdAt: '2026-06-09T09:00:00Z',
  },
  {
    id: 305, title: 'QA Engineer', status: JobStatus.Draft,
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Onsite, seniorityLevel: SeniorityLevel.Mid,
    location: 'Yangon, Myanmar', salaryMin: 1_500_000, salaryMax: 2_200_000, currency: 'MMK',
    applicantCount: 0, ownerId: 2, ownerName: 'Kyaw Zin Latt',
    createdAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 306, title: 'Data Engineer', status: JobStatus.Published,
    employmentType: EmploymentType.FullTime, workMode: WorkMode.Remote, seniorityLevel: SeniorityLevel.Senior,
    location: 'Remote', salaryMin: 2_600_000, salaryMax: 3_800_000, currency: 'MMK',
    applicantCount: 6, ownerId: 5, ownerName: 'Thiri Aung',
    createdAt: '2026-05-30T09:00:00Z', publishedAt: '2026-06-02T09:00:00Z',
  },
  {
    id: 307, title: 'Frontend Intern', status: JobStatus.Closed,
    employmentType: EmploymentType.Internship, workMode: WorkMode.Onsite, seniorityLevel: SeniorityLevel.Entry,
    location: 'Yangon, Myanmar', salaryMin: 400_000, salaryMax: 600_000, currency: 'MMK',
    applicantCount: 24, ownerId: 2, ownerName: 'Kyaw Zin Latt',
    createdAt: '2026-04-15T09:00:00Z', publishedAt: '2026-04-18T09:00:00Z',
  },
  {
    id: 308, title: 'Scrum Master', status: JobStatus.PendingApproval, approvalStage: JobApprovalStage.PendingAdmin,
    employmentType: EmploymentType.Contract, workMode: WorkMode.Hybrid, seniorityLevel: SeniorityLevel.Lead,
    location: 'Yangon, Myanmar', salaryMin: 3_000_000, salaryMax: 4_200_000, currency: 'MMK',
    applicantCount: 0, ownerId: 5, ownerName: 'Thiri Aung',
    createdAt: '2026-06-07T09:00:00Z',
  },
];
