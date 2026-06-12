import { JobStatus } from '@core/enums/job-status.enum';

export type JobSortOption = 'newest' | 'title' | 'applicants';
export type JobOwnerScope = 'all' | 'mine';

export interface JobListQuery {
  status?: JobStatus;
  ownerScope: JobOwnerScope;
  keyword?: string;
  sort: JobSortOption;
  page: number;
  pageSize: number;
}
