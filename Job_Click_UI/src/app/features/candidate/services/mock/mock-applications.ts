import { Application } from '@core/models/application.model';
import { JobSummary } from '@core/models/job.model';
import { ApplicationStatus } from '@core/enums/application-status.enum';
import { findMockJob } from './mock-jobs';

function job(id: number): JobSummary {
  const found = findMockJob(id);
  if (!found) {
    throw new Error(`Mock job ${id} not found`);
  }
  return found;
}

/** The candidate's applications, spanning multiple pipeline statuses. */
export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 9001,
    job: job(1),
    resumeId: 1,
    coverNote:
      'I have over four years building Angular applications and led the rebuild of my current team’s design system. I’m excited about this role because of your focus on enterprise UX, and I can start within a month.',
    status: ApplicationStatus.Interview,
    matchScore: 88,
    appliedAt: '2026-06-02T10:15:00Z',
    statusHistory: [
      { status: ApplicationStatus.Applied, changedAt: '2026-06-02T10:15:00Z' },
      { status: ApplicationStatus.Viewed, changedAt: '2026-06-03T08:30:00Z' },
      { status: ApplicationStatus.Shortlisted, changedAt: '2026-06-04T14:00:00Z' },
      { status: ApplicationStatus.Interview, changedAt: '2026-06-06T09:00:00Z', remarks: 'Technical interview scheduled.' },
    ],
  },
  {
    id: 9002,
    job: job(3),
    resumeId: 1,
    status: ApplicationStatus.Shortlisted,
    matchScore: 81,
    appliedAt: '2026-06-01T09:00:00Z',
    statusHistory: [
      { status: ApplicationStatus.Applied, changedAt: '2026-06-01T09:00:00Z' },
      { status: ApplicationStatus.Screening, changedAt: '2026-06-02T11:00:00Z' },
      { status: ApplicationStatus.Shortlisted, changedAt: '2026-06-05T16:20:00Z' },
    ],
  },
  {
    id: 9003,
    job: job(2),
    resumeId: 1,
    status: ApplicationStatus.Screening,
    matchScore: 92,
    appliedAt: '2026-05-30T13:40:00Z',
    statusHistory: [
      { status: ApplicationStatus.Applied, changedAt: '2026-05-30T13:40:00Z' },
      { status: ApplicationStatus.Viewed, changedAt: '2026-05-31T10:00:00Z' },
      { status: ApplicationStatus.Screening, changedAt: '2026-06-01T09:30:00Z' },
    ],
  },
  {
    id: 9004,
    job: job(6),
    resumeId: 1,
    coverNote:
      'My background in data pipelines and cloud infrastructure maps closely to this position. I’m particularly drawn to the remote setup and the scale of data you work with.',
    status: ApplicationStatus.Offer,
    matchScore: 79,
    appliedAt: '2026-05-20T08:00:00Z',
    statusHistory: [
      { status: ApplicationStatus.Applied, changedAt: '2026-05-20T08:00:00Z' },
      { status: ApplicationStatus.Shortlisted, changedAt: '2026-05-24T12:00:00Z' },
      { status: ApplicationStatus.Interview, changedAt: '2026-05-28T15:00:00Z' },
      { status: ApplicationStatus.Offer, changedAt: '2026-06-04T11:00:00Z', remarks: 'Offer extended.' },
    ],
  },
  {
    id: 9005,
    job: job(10),
    resumeId: 1,
    status: ApplicationStatus.Applied,
    matchScore: 74,
    appliedAt: '2026-06-07T17:25:00Z',
    statusHistory: [{ status: ApplicationStatus.Applied, changedAt: '2026-06-07T17:25:00Z' }],
  },
  {
    id: 9006,
    job: job(7),
    resumeId: 1,
    status: ApplicationStatus.Rejected,
    matchScore: 61,
    appliedAt: '2026-05-15T09:00:00Z',
    statusHistory: [
      { status: ApplicationStatus.Applied, changedAt: '2026-05-15T09:00:00Z' },
      { status: ApplicationStatus.Screening, changedAt: '2026-05-17T10:00:00Z' },
      { status: ApplicationStatus.Rejected, changedAt: '2026-05-22T14:00:00Z', remarks: 'Position filled.' },
    ],
  },
];
