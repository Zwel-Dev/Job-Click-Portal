import { ModeratedJob } from '@core/models/admin-platform.model';
import { JobStatus } from '@core/enums/job-status.enum';

/**
 * Platform-wide jobs for the moderation screen — mixed statuses, a few flagged,
 * and two duplicate groups (jobs 5↔20 and 8↔21) so duplicate detection has work.
 */
export const MOCK_MODERATED_JOBS: readonly ModeratedJob[] = [
  { id: 1, title: 'Frontend Engineer (Angular)', companyName: 'Greenline Technologies', status: JobStatus.Published, flagged: false, applicants: 42, postedAt: '2026-05-28T09:00:00Z' },
  { id: 2, title: 'Product Designer', companyName: 'Greenline Technologies', status: JobStatus.Published, flagged: false, applicants: 18, postedAt: '2026-05-30T09:00:00Z' },
  { id: 3, title: 'Data Analyst', companyName: 'BrightPath Solutions', status: JobStatus.Published, flagged: false, applicants: 27, postedAt: '2026-06-01T09:00:00Z' },
  { id: 4, title: 'HR Coordinator', companyName: 'BrightPath Solutions', status: JobStatus.Paused, flagged: false, applicants: 9, postedAt: '2026-04-18T09:00:00Z' },
  { id: 5, title: 'Senior Backend Engineer', companyName: 'Greenline Technologies', status: JobStatus.Published, flagged: false, applicants: 35, postedAt: '2026-05-20T09:00:00Z' },
  { id: 6, title: 'Logistics Coordinator', companyName: 'BlueWave Logistics', status: JobStatus.Published, flagged: false, applicants: 51, postedAt: '2026-06-03T09:00:00Z' },
  { id: 7, title: 'Warehouse Supervisor', companyName: 'BlueWave Logistics', status: JobStatus.Published, flagged: false, applicants: 22, postedAt: '2026-06-05T09:00:00Z' },
  { id: 8, title: 'Customer Support Specialist', companyName: 'Horizon Media House', status: JobStatus.Published, flagged: false, applicants: 14, postedAt: '2026-05-22T09:00:00Z' },
  { id: 9, title: 'Work-from-home Data Entry — Earn Fast!', companyName: 'SwiftMart Retail', status: JobStatus.Published, flagged: true, flagReason: 'Requests an upfront payment from applicants — likely a scam.', applicants: 8, postedAt: '2026-06-12T09:00:00Z' },
  { id: 10, title: 'Marketing Intern', companyName: 'Horizon Media House', status: JobStatus.PendingApproval, flagged: false, applicants: 0, postedAt: '2026-06-14T09:00:00Z' },
  { id: 11, title: 'Finance Manager', companyName: 'Apex Finance Group', status: JobStatus.Published, flagged: false, applicants: 11, postedAt: '2026-06-09T09:00:00Z' },
  { id: 12, title: 'Registered Nurse', companyName: 'Quantum Health Labs', status: JobStatus.Published, flagged: false, applicants: 33, postedAt: '2026-06-06T09:00:00Z' },
  { id: 13, title: 'Lab Technician', companyName: 'Quantum Health Labs', status: JobStatus.Published, flagged: false, applicants: 17, postedAt: '2026-06-08T09:00:00Z' },
  { id: 14, title: 'Mobile Developer (Flutter)', companyName: 'Greenline Technologies', status: JobStatus.Closed, flagged: false, applicants: 29, postedAt: '2026-03-10T09:00:00Z' },
  { id: 15, title: 'Easy Money — No Experience Needed', companyName: 'SwiftMart Retail', status: JobStatus.Published, flagged: true, flagReason: 'Misleading title and unrealistic pay claims.', applicants: 5, postedAt: '2026-06-13T09:00:00Z' },
  { id: 16, title: 'QA Engineer', companyName: 'BrightPath Solutions', status: JobStatus.Published, flagged: false, applicants: 20, postedAt: '2026-06-02T09:00:00Z' },
  { id: 17, title: 'Account Executive', companyName: 'BlueWave Logistics', status: JobStatus.Expired, flagged: false, applicants: 13, postedAt: '2026-02-15T09:00:00Z' },
  { id: 18, title: 'Content Writer', companyName: 'Horizon Media House', status: JobStatus.Published, flagged: true, flagReason: 'Reported by candidates for ghost posting (role appears never to be filled).', applicants: 47, postedAt: '2026-05-10T09:00:00Z' },
  // Duplicate group A: near-identical to #5 (Greenline backend role).
  { id: 20, title: 'Sr. Backend Engineer', companyName: 'Greenline Technologies', status: JobStatus.Published, flagged: false, applicants: 6, postedAt: '2026-05-21T09:00:00Z', duplicateOf: 5 },
  // Duplicate group B: near-identical to #8 (Horizon support role).
  { id: 21, title: 'Customer Support Agent', companyName: 'Horizon Media House', status: JobStatus.Published, flagged: false, applicants: 4, postedAt: '2026-05-23T09:00:00Z', duplicateOf: 8 },
];
