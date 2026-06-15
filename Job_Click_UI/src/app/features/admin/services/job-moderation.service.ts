import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { ApiError, Id, Paginated } from '@core/models/common.model';
import { ModeratedJob } from '@core/models/admin-platform.model';
import { AuditAction } from '@core/enums/audit-action.enum';
import { ModeratedJobGroup, ModeratedJobQuery } from '../models/job-moderation.model';
import { AuditLogService, AuditRecordInput } from './audit-log.service';
import { MOCK_MODERATED_JOBS } from './mock/mock-admin-jobs';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/admin/jobs';

/**
 * Platform-admin job moderation. Stateful mock so flag / unflag / remove persist
 * for the session; real branch via `ApiBaseService`. Duplicate detection groups
 * postings by `duplicateOf` (advisory).
 */
@Injectable({ providedIn: 'root' })
export class JobModerationService {
  private readonly api = inject(ApiBaseService);
  private readonly audit = inject(AuditLogService);

  private jobs: ModeratedJob[] = clone([...MOCK_MODERATED_JOBS]);

  /** Paginated, filtered, newest-first list. */
  list(query: ModeratedJobQuery): Observable<Paginated<ModeratedJob>> {
    if (!environment.useMock) {
      return this.api.getPaginated<ModeratedJob>(ENDPOINT, {
        keyword: query.keyword,
        status: query.status,
        flagged: query.flagged,
        page: query.page,
        pageSize: query.pageSize,
      });
    }

    let items = [...this.jobs];
    const keyword = query.keyword?.trim().toLowerCase();
    if (keyword) {
      items = items.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword) || job.companyName.toLowerCase().includes(keyword),
      );
    }
    if (query.status) {
      items = items.filter((job) => job.status === query.status);
    }
    if (query.flagged === 'flagged') {
      items = items.filter((job) => job.flagged);
    } else if (query.flagged === 'unflagged') {
      items = items.filter((job) => !job.flagged);
    }
    items.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));

    const totalItems = items.length;
    const start = (query.page - 1) * query.pageSize;
    const data = clone(items.slice(start, start + query.pageSize));
    return of({
      data,
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
    }).pipe(delay(MOCK_LATENCY));
  }

  /** Groups of near-identical postings (canonical + its duplicates). */
  duplicates(): Observable<ModeratedJobGroup[]> {
    if (!environment.useMock) {
      return this.api.get<ModeratedJobGroup[]>(`${ENDPOINT}/duplicates`);
    }
    const byId = new Map(this.jobs.map((job) => [job.id, job]));
    const grouped = new Map<Id, ModeratedJob[]>();
    for (const job of this.jobs) {
      if (job.duplicateOf !== undefined) {
        const list = grouped.get(job.duplicateOf) ?? [];
        list.push(job);
        grouped.set(job.duplicateOf, list);
      }
    }
    const groups: ModeratedJobGroup[] = [];
    for (const [originalId, duplicates] of grouped) {
      const original = byId.get(originalId);
      if (original) {
        groups.push({ original: clone(original), duplicates: clone(duplicates) });
      }
    }
    return of(groups).pipe(delay(MOCK_LATENCY));
  }

  flag(id: Id, reason: string): Observable<ModeratedJob> {
    if (!environment.useMock) {
      return this.api.post<ModeratedJob>(`${ENDPOINT}/${id}/flag`, { reason });
    }
    return this.mutate(id, (job) => ({ ...job, flagged: true, flagReason: reason }), (job) => ({
      action: AuditAction.Update,
      entityType: 'Job',
      entityId: job.id,
      summary: `Flagged job "${job.title}"`,
    }));
  }

  unflag(id: Id): Observable<ModeratedJob> {
    if (!environment.useMock) {
      return this.api.post<ModeratedJob>(`${ENDPOINT}/${id}/unflag`, {});
    }
    return this.mutate(id, (job) => ({ ...job, flagged: false, flagReason: undefined }), (job) => ({
      action: AuditAction.Update,
      entityType: 'Job',
      entityId: job.id,
      summary: `Unflagged job "${job.title}"`,
    }));
  }

  /** Takes the posting down (terminal). */
  remove(id: Id): Observable<ModeratedJob> {
    if (!environment.useMock) {
      return this.api.post<ModeratedJob>(`${ENDPOINT}/${id}/remove`, {});
    }
    return this.mutate(id, (job) => ({ ...job, removed: true }), (job) => ({
      action: AuditAction.Delete,
      entityType: 'Job',
      entityId: job.id,
      summary: `Removed job "${job.title}"`,
    }));
  }

  private mutate(
    id: Id,
    change: (job: ModeratedJob) => ModeratedJob,
    audit: (job: ModeratedJob) => AuditRecordInput,
  ): Observable<ModeratedJob> {
    const existing = this.jobs.find((job) => job.id === id);
    if (!existing) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    const updated = change(existing);
    this.jobs = this.jobs.map((job) => (job.id === id ? updated : job));
    this.audit.record(audit(updated));
    return of(clone(updated)).pipe(delay(MOCK_LATENCY));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
