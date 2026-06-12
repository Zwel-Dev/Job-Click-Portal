import { Id } from '@core/models/common.model';
import { AssessmentStatus } from '@core/enums/assessment-status.enum';
import { Assessment } from '@core/models/assessment.model';

/** Assessments keyed by applicationId (ids map to MOCK_APPLICANTS). */
export const MOCK_ASSESSMENTS: Record<Id, Assessment[]> = {
  9001: [
    {
      id: 8001, applicationId: 9001, name: 'Frontend Coding Challenge', status: AssessmentStatus.Passed,
      score: 88, assignedAt: '2026-06-03T05:00:00Z', submittedAt: '2026-06-04T03:30:00Z',
      remarks: 'Clean component structure; strong RxJS usage.',
    },
  ],
  9002: [
    {
      id: 8002, applicationId: 9002, name: 'Frontend Coding Challenge', status: AssessmentStatus.InProgress,
      assignedAt: '2026-06-05T06:00:00Z',
    },
  ],
  9006: [
    {
      id: 8003, applicationId: 9006, name: 'System Design Exercise', status: AssessmentStatus.Passed,
      score: 92, assignedAt: '2026-06-02T04:00:00Z', submittedAt: '2026-06-03T08:00:00Z',
      remarks: 'Excellent trade-off analysis.',
    },
  ],
  9103: [
    {
      id: 8004, applicationId: 9103, name: 'DevOps Practical', status: AssessmentStatus.Submitted,
      score: 80, assignedAt: '2026-06-04T06:00:00Z', submittedAt: '2026-06-05T09:00:00Z',
    },
    {
      id: 8005, applicationId: 9103, name: 'Cloud Architecture Quiz', status: AssessmentStatus.Passed,
      score: 85, assignedAt: '2026-06-04T06:00:00Z', submittedAt: '2026-06-04T10:00:00Z',
    },
  ],
};
