import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { ApiError, Id } from '@core/models/common.model';
import { ApplicationStatus } from '@core/enums/application-status.enum';
import { ApplicantDetail, ApplicantSummary, CandidateNote } from '@core/models/applicant.model';
import { MOCK_APPLICANTS } from './mock/mock-applicants';
import { MOCK_EMPLOYER_JOBS } from './mock/mock-employer-jobs';

const MOCK_LATENCY = 400;
const ENDPOINT = '/api/v1/employer';

const JOB_TITLES = new Map<Id, string>(MOCK_EMPLOYER_JOBS.map((job) => [job.id, job.title]));

/**
 * Applicant pipeline API. Stateful mock so stage moves, notes, and tags persist
 * for the session and stay consistent between the board and the detail view.
 */
@Injectable({ providedIn: 'root' })
export class ApplicantService {
  private readonly api = inject(ApiBaseService);
  private readonly currentUser = inject(CurrentUserStore);

  private readonly byJob = new Map<Id, ApplicantDetail[]>(
    Object.entries(MOCK_APPLICANTS).map(([jobId, applicants]) => {
      const id = Number(jobId);
      const jobTitle = JOB_TITLES.get(id) ?? '';
      const detailed: ApplicantDetail[] = clone(applicants).map((applicant) => ({
        ...applicant,
        jobId: id,
        jobTitle,
      }));
      return [id, detailed];
    }),
  );
  private nextNoteId = 10_000;

  /** Applicants in a job's pipeline (summaries for the Kanban board). */
  pipeline(jobId: Id): Observable<ApplicantSummary[]> {
    if (!environment.useMock) {
      return this.api.get<ApplicantSummary[]>(`${ENDPOINT}/jobs/${jobId}/applicants`);
    }
    const applicants = this.byJob.get(jobId) ?? [];
    return of(applicants.map(toSummary)).pipe(delay(MOCK_LATENCY));
  }

  /** Every applicant across the company's pipelines (summaries), newest first. */
  listAll(): Observable<ApplicantSummary[]> {
    if (!environment.useMock) {
      return this.api.get<ApplicantSummary[]>(`${ENDPOINT}/applicants`);
    }
    const all = [...this.byJob.values()]
      .flat()
      .map(toSummary)
      .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
    return of(all).pipe(delay(MOCK_LATENCY));
  }

  /** Full applicant detail for the detail view. */
  getApplicant(applicationId: Id): Observable<ApplicantDetail> {
    if (!environment.useMock) {
      return this.api.get<ApplicantDetail>(`${ENDPOINT}/applicants/${applicationId}`);
    }
    const applicant = this.find(applicationId);
    if (!applicant) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    return of(clone(applicant)).pipe(delay(MOCK_LATENCY));
  }

  /** Moves an applicant to a new pipeline stage (records a status event). */
  moveStage(applicationId: Id, status: ApplicationStatus): Observable<ApplicantSummary> {
    if (!environment.useMock) {
      return this.api.post<ApplicantSummary>(`${ENDPOINT}/applicants/${applicationId}/status`, { status });
    }
    const applicant = this.find(applicationId);
    if (!applicant) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    if (applicant.status !== status) {
      applicant.status = status;
      applicant.statusHistory = [
        ...applicant.statusHistory,
        { status, changedAt: new Date().toISOString() },
      ];
    }
    return of(toSummary(applicant)).pipe(delay(MOCK_LATENCY));
  }

  /** Adds an internal note to an applicant (authored by the current user). */
  addNote(applicationId: Id, body: string): Observable<CandidateNote> {
    if (!environment.useMock) {
      return this.api.post<CandidateNote>(`${ENDPOINT}/applicants/${applicationId}/notes`, { body });
    }
    const applicant = this.find(applicationId);
    if (!applicant) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    const note: CandidateNote = {
      id: this.nextNoteId++,
      author: this.currentUser.displayName() || 'You',
      body,
      createdAt: new Date().toISOString(),
    };
    applicant.notes = [...applicant.notes, note];
    return of(clone(note)).pipe(delay(MOCK_LATENCY));
  }

  /** Replaces an applicant's tag set. */
  setTags(applicationId: Id, tags: string[]): Observable<string[]> {
    if (!environment.useMock) {
      return this.api.put<string[]>(`${ENDPOINT}/applicants/${applicationId}/tags`, { tags });
    }
    const applicant = this.find(applicationId);
    if (!applicant) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    applicant.tags = [...tags];
    return of([...applicant.tags]).pipe(delay(MOCK_LATENCY));
  }

  private find(applicationId: Id): ApplicantDetail | undefined {
    for (const applicants of this.byJob.values()) {
      const match = applicants.find((item) => item.applicationId === applicationId);
      if (match) {
        return match;
      }
    }
    return undefined;
  }
}

function toSummary(detail: ApplicantDetail): ApplicantSummary {
  return {
    applicationId: detail.applicationId,
    candidateId: detail.candidateId,
    jobId: detail.jobId,
    jobTitle: detail.jobTitle,
    fullName: detail.fullName,
    headline: detail.headline,
    avatarUrl: detail.avatarUrl,
    status: detail.status,
    matchScore: detail.matchScore,
    appliedAt: detail.appliedAt,
    resumeId: detail.resumeId,
    tags: [...detail.tags],
  };
}

function notFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'Applicant not found.' };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
