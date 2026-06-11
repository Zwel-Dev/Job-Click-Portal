import { EmploymentType } from '@core/enums/employment-type.enum';
import { SeniorityLevel } from '@core/enums/seniority-level.enum';

export type JobSortOption = 'relevance' | 'newest' | 'salary';

/** Filters + paging for the job search page (mirrors the query string). */
export interface JobSearchQuery {
  keyword?: string;
  location?: string;
  salaryMin?: number;
  industry?: string;
  company?: string;
  employmentTypes?: EmploymentType[];
  seniorityLevels?: SeniorityLevel[];
  remote?: boolean;
  sort: JobSortOption;
  page: number;
  pageSize: number;
}
