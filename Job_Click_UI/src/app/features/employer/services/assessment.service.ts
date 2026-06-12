import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { ApiError, Id } from '@core/models/common.model';
import { ASSESSMENT_COMPLETED_STATUSES } from '@core/enums/assessment-status.enum';
import { Assessment, AssessmentFormValue } from '@core/models/assessment.model';
import { MOCK_ASSESSMENTS } from './mock/mock-assessments';

const MOCK_LATENCY = 400;
const ENDPOINT = '/api/v1/employer/assessments';

/** Assessment capture on an application. Stateful mock; persists for the session. */
@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly api = inject(ApiBaseService);

  private readonly byApplication = new Map<Id, Assessment[]>(
    Object.entries(MOCK_ASSESSMENTS).map(([applicationId, assessments]) => [
      Number(applicationId),
      clone(assessments),
    ]),
  );
  private nextId = 8100;

  listByApplication(applicationId: Id): Observable<Assessment[]> {
    if (!environment.useMock) {
      return this.api.get<Assessment[]>(`${ENDPOINT}/by-application/${applicationId}`);
    }
    const items = (this.byApplication.get(applicationId) ?? [])
      .slice()
      .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
    return of(clone(items)).pipe(delay(MOCK_LATENCY));
  }

  add(applicationId: Id, value: AssessmentFormValue): Observable<Assessment> {
    if (!environment.useMock) {
      return this.api.post<Assessment>(ENDPOINT, { applicationId, ...value });
    }
    const now = new Date().toISOString();
    const assessment: Assessment = {
      id: this.nextId++,
      applicationId,
      name: value.name,
      status: value.status,
      score: value.score,
      assignedAt: now,
      submittedAt: isCompleted(value) ? now : undefined,
      remarks: value.remarks,
    };
    const existing = this.byApplication.get(applicationId) ?? [];
    this.byApplication.set(applicationId, [...existing, assessment]);
    return of(clone(assessment)).pipe(delay(MOCK_LATENCY));
  }

  update(id: Id, value: AssessmentFormValue): Observable<Assessment> {
    if (!environment.useMock) {
      return this.api.put<Assessment>(`${ENDPOINT}/${id}`, value);
    }
    const found = this.find(id);
    if (!found) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    found.name = value.name;
    found.status = value.status;
    found.score = value.score;
    found.remarks = value.remarks;
    if (isCompleted(value) && !found.submittedAt) {
      found.submittedAt = new Date().toISOString();
    }
    return of(clone(found)).pipe(delay(MOCK_LATENCY));
  }

  remove(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${ENDPOINT}/${id}`);
    }
    for (const [applicationId, assessments] of this.byApplication.entries()) {
      if (assessments.some((item) => item.id === id)) {
        this.byApplication.set(applicationId, assessments.filter((item) => item.id !== id));
        break;
      }
    }
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  private find(id: Id): Assessment | undefined {
    for (const assessments of this.byApplication.values()) {
      const match = assessments.find((item) => item.id === id);
      if (match) {
        return match;
      }
    }
    return undefined;
  }
}

function isCompleted(value: AssessmentFormValue): boolean {
  return ASSESSMENT_COMPLETED_STATUSES.includes(value.status);
}

function notFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'Assessment not found.' };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
