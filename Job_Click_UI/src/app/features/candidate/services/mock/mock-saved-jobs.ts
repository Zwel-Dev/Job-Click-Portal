import { SavedJob } from '@core/models/job.model';
import { JobSummary } from '@core/models/job.model';
import { findMockJob } from './mock-jobs';

function job(id: number): JobSummary {
  const found = findMockJob(id);
  if (!found) {
    throw new Error(`Mock job ${id} not found`);
  }
  return { ...found, isSaved: true };
}

/** Jobs the candidate has bookmarked. */
export const MOCK_SAVED_JOBS: SavedJob[] = [
  { id: 7001, job: job(4), savedAt: '2026-06-06T12:00:00Z' },
  { id: 7002, job: job(8), savedAt: '2026-06-05T18:30:00Z' },
  { id: 7003, job: job(11), savedAt: '2026-06-03T08:15:00Z' },
];
