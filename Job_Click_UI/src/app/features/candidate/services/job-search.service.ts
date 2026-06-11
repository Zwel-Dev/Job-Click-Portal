import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { ApiError, Id, Paginated } from '@core/models/common.model';
import { Job, JobSummary } from '@core/models/job.model';
import { WorkMode } from '@core/enums/work-mode.enum';
import { JobSearchQuery, JobSortOption } from '../models/job-search-query.model';
import { MOCK_JOB_SUMMARIES, findMockJob } from './mock/mock-jobs';
import { buildJobDetail } from './mock/mock-job-detail';
import { SavedJobService } from './saved-job.service';

const MOCK_LATENCY = 500;

export interface JobFilterFacets {
  industries: string[];
  companies: string[];
}

/** Job search + retrieval (shared with the public site later). */
@Injectable({ providedIn: 'root' })
export class JobSearchService {
  private readonly api = inject(ApiBaseService);
  private readonly savedJobService = inject(SavedJobService);

  /** Most recently published jobs (dashboard "Newest jobs" widget). */
  getNewest(limit = 6): Observable<JobSummary[]> {
    if (!environment.useMock) {
      return this.api
        .getPaginated<JobSummary>(API.jobs.search, { sort: '-publishedAt', pageSize: limit })
        .pipe(map((page) => page.data));
    }
    const sorted = [...MOCK_JOB_SUMMARIES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return of(this.withSavedFlag(sorted.slice(0, limit))).pipe(delay(MOCK_LATENCY));
  }

  search(query: JobSearchQuery): Observable<Paginated<JobSummary>> {
    if (!environment.useMock) {
      const params: Record<string, string | number | boolean> = {
        sort: query.sort,
        page: query.page,
        pageSize: query.pageSize,
      };
      if (query.keyword) params['keyword'] = query.keyword;
      if (query.location) params['location'] = query.location;
      if (query.salaryMin) params['salaryMin'] = query.salaryMin;
      if (query.industry) params['industry'] = query.industry;
      if (query.company) params['company'] = query.company;
      if (query.employmentTypes?.length) params['employmentTypes'] = query.employmentTypes.join(',');
      if (query.seniorityLevels?.length) params['seniorityLevels'] = query.seniorityLevels.join(',');
      if (query.remote) params['remote'] = true;
      return this.api.getPaginated<JobSummary>(API.jobs.search, params);
    }
    const filtered = this.sortJobs(
      MOCK_JOB_SUMMARIES.filter((job) => this.matches(job, query)),
      query.sort,
    );
    const totalItems = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const pageItems = this.withSavedFlag(filtered.slice(start, start + query.pageSize));

    const result: Paginated<JobSummary> = {
      data: pageItems,
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
    };
    return of(result).pipe(delay(MOCK_LATENCY));
  }

  getById(id: Id): Observable<Job> {
    if (!environment.useMock) {
      return this.api.get<Job>(API.jobs.byId(id));
    }
    const summary = findMockJob(Number(id));
    if (!summary) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'This job could not be found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    const job = buildJobDetail({ ...summary, isSaved: this.savedJobService.isSaved(summary.id) });
    return of(job).pipe(delay(MOCK_LATENCY));
  }

  getFilterFacets(): Observable<JobFilterFacets> {
    if (!environment.useMock) {
      return this.api.get<JobFilterFacets>(`${API.jobs.search}/facets`);
    }
    const industries = unique(
      MOCK_JOB_SUMMARIES.map((job) => job.industry).filter((value): value is string => Boolean(value)),
    );
    const companies = unique(MOCK_JOB_SUMMARIES.map((job) => job.companyName));
    return of({ industries: industries.sort(), companies: companies.sort() }).pipe(delay(MOCK_LATENCY));
  }

  // --- Mock filtering -------------------------------------------------------

  private matches(job: JobSummary, query: JobSearchQuery): boolean {
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      const haystack = `${job.title} ${job.companyName}`.toLowerCase();
      if (!haystack.includes(keyword)) {
        return false;
      }
    }
    if (query.location && !job.location.toLowerCase().includes(query.location.toLowerCase())) {
      return false;
    }
    if (query.salaryMin && (job.salaryMax ?? job.salaryMin ?? 0) < query.salaryMin) {
      return false;
    }
    if (query.industry && job.industry !== query.industry) {
      return false;
    }
    if (query.company && job.companyName !== query.company) {
      return false;
    }
    if (query.employmentTypes?.length && !query.employmentTypes.includes(job.employmentType)) {
      return false;
    }
    if (query.seniorityLevels?.length && !query.seniorityLevels.includes(job.seniorityLevel)) {
      return false;
    }
    if (query.remote && job.workMode !== WorkMode.Remote) {
      return false;
    }
    return true;
  }

  private sortJobs(jobs: JobSummary[], sort: JobSortOption): JobSummary[] {
    const sorted = [...jobs];
    switch (sort) {
      case 'salary':
        return sorted.sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0));
      case 'newest':
      case 'relevance':
      default:
        return sorted.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    }
  }

  private withSavedFlag(jobs: JobSummary[]): JobSummary[] {
    return jobs.map((job) => ({ ...job, isSaved: this.savedJobService.isSaved(job.id) }));
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
