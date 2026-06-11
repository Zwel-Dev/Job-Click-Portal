import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { ApiError, Id } from '@core/models/common.model';
import { Application, ApplyRequest } from '@core/models/application.model';
import { ApplicationStatus } from '@core/enums/application-status.enum';
import { MOCK_APPLICATIONS } from './mock/mock-applications';
import { findMockJob } from './mock/mock-jobs';

const MOCK_LATENCY = 500;

/**
 * Candidate applications. Stateful in the mock backend so new applications
 * appear in the list/dashboard. Pagination/detail/withdraw arrive in C1.5.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = inject(ApiBaseService);

  private applications: Application[] = clone(MOCK_APPLICATIONS);
  private nextId = 9100;

  list(): Observable<Application[]> {
    if (!environment.useMock) {
      return this.api.get<Application[]>(API.candidate.applications);
    }
    const sorted = [...this.applications].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
    return of(clone(sorted)).pipe(delay(MOCK_LATENCY));
  }

  getById(id: Id): Observable<Application> {
    if (!environment.useMock) {
      return this.api.get<Application>(`${API.candidate.applications}/${id}`);
    }
    const found = this.applications.find((application) => application.id === id);
    if (!found) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Application not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    return of(clone(found)).pipe(delay(MOCK_LATENCY));
  }

  withdraw(id: Id): Observable<Application> {
    if (!environment.useMock) {
      return this.api.post<Application>(`${API.candidate.applications}/${id}/withdraw`, {});
    }
    const found = this.applications.find((application) => application.id === id);
    if (!found) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Application not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    const now = new Date().toISOString();
    found.status = ApplicationStatus.Withdrawn;
    found.statusHistory = [...found.statusHistory, { status: ApplicationStatus.Withdrawn, changedAt: now }];
    return of(clone(found)).pipe(delay(MOCK_LATENCY));
  }

  findByJob(jobId: Id): Observable<Application | null> {
    if (!environment.useMock) {
      return this.api.get<Application | null>(`${API.candidate.applications}/by-job/${jobId}`);
    }
    const found = this.applications.find((application) => application.job.id === jobId) ?? null;
    return of(found ? clone(found) : null).pipe(delay(MOCK_LATENCY));
  }

  apply(request: ApplyRequest): Observable<Application> {
    if (!environment.useMock) {
      return this.api.post<Application>(API.jobs.apply(request.jobId), request);
    }
    // Idempotent: re-applying returns the existing application.
    const existing = this.applications.find((application) => application.job.id === request.jobId);
    if (existing) {
      return of(clone(existing)).pipe(delay(MOCK_LATENCY));
    }
    const summary = findMockJob(Number(request.jobId));
    if (!summary) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    const now = new Date().toISOString();
    const application: Application = {
      id: this.nextId++,
      job: { ...summary },
      resumeId: request.resumeId,
      status: ApplicationStatus.Applied,
      appliedAt: now,
      statusHistory: [{ status: ApplicationStatus.Applied, changedAt: now }],
    };
    this.applications = [application, ...this.applications];
    return of(clone(application)).pipe(delay(MOCK_LATENCY));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
