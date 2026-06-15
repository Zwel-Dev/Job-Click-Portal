import { ModeratedJob } from '@core/models/admin-platform.model';
import { JobStatus } from '@core/enums/job-status.enum';

/** Flagged filter for the moderation list. */
export type FlaggedFilter = 'all' | 'flagged' | 'unflagged';

/** Query for the job moderation list (search + filters + pagination). */
export interface ModeratedJobQuery {
  keyword?: string;
  status?: JobStatus;
  flagged?: FlaggedFilter;
  page: number;
  pageSize: number;
}

/** A canonical posting plus its near-identical duplicates (advisory grouping). */
export interface ModeratedJobGroup {
  original: ModeratedJob;
  duplicates: ModeratedJob[];
}
