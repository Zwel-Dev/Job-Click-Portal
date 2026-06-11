import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { Id } from '@core/models/common.model';
import { SavedJob } from '@core/models/job.model';
import { MOCK_SAVED_JOBS } from './mock/mock-saved-jobs';
import { findMockJob } from './mock/mock-jobs';

const MOCK_LATENCY = 350;

/**
 * Saved (bookmarked) jobs. Holds saved state in memory so the search page's
 * save toggle works; the full saved-jobs page + cross-page sync arrive in C1.5.
 */
@Injectable({ providedIn: 'root' })
export class SavedJobService {
  private readonly api = inject(ApiBaseService);

  /** jobId -> savedAt ISO timestamp. */
  private readonly saved = new Map<Id, string>(MOCK_SAVED_JOBS.map((s) => [s.job.id, s.savedAt]));

  isSaved(jobId: Id): boolean {
    return this.saved.has(jobId);
  }

  list(): Observable<SavedJob[]> {
    if (!environment.useMock) {
      return this.api.get<SavedJob[]>(API.candidate.savedJobs);
    }
    const items: SavedJob[] = [];
    for (const [jobId, savedAt] of this.saved) {
      const job = findMockJob(jobId);
      if (job) {
        items.push({ id: jobId, job: { ...job, isSaved: true }, savedAt });
      }
    }
    items.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return of(JSON.parse(JSON.stringify(items)) as SavedJob[]).pipe(delay(MOCK_LATENCY));
  }

  save(jobId: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.post<void>(API.candidate.savedJobs, { jobId });
    }
    if (!this.saved.has(jobId)) {
      this.saved.set(jobId, new Date().toISOString());
    }
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  remove(jobId: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${API.candidate.savedJobs}/${jobId}`);
    }
    this.saved.delete(jobId);
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }
}
