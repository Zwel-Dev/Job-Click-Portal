import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { ApiError, Id, Paginated } from '@core/models/common.model';
import { JobStatus } from '@core/enums/job-status.enum';
import { JobApprovalStage } from '@core/enums/job-approval-stage.enum';
import { JobSkillRequirement } from '@core/models/job.model';
import { ScreeningQuestion } from '@core/models/screening.model';
import { ScreeningQuestionType } from '@core/enums/screening-question-type.enum';
import { EmployerJob } from '../models/employer-job.model';
import { EmployerJobDetail } from '../models/employer-job-detail.model';
import { JobFormValue } from '../models/job-form.model';
import { JobListQuery, JobSortOption } from '../models/job-list-query.model';
import { MOCK_EMPLOYER_JOBS } from './mock/mock-employer-jobs';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/employer/jobs';

export type JobTransition = 'pause' | 'resume' | 'close' | 'archive' | 'duplicate';

/** Employer job management. Stateful mock so create/transition persist this session. */
@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly api = inject(ApiBaseService);
  private readonly currentUser = inject(CurrentUserStore);

  private jobs: EmployerJob[] = clone(MOCK_EMPLOYER_JOBS);
  private readonly formValues = new Map<Id, JobFormValue>();
  private nextId = 400;

  list(query: JobListQuery): Observable<Paginated<EmployerJob>> {
    if (!environment.useMock) {
      return this.api.getPaginated<EmployerJob>(ENDPOINT, {
        status: query.status,
        owner: query.ownerScope,
        q: query.keyword,
        sort: query.sort,
        page: query.page,
        pageSize: query.pageSize,
      });
    }

    let items = [...this.jobs];
    if (query.status) {
      items = items.filter((job) => job.status === query.status);
    }
    if (query.ownerScope === 'mine') {
      const userId = this.currentUser.user()?.id;
      items = items.filter((job) => job.ownerId === userId);
    }
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      items = items.filter((job) => job.title.toLowerCase().includes(keyword));
    }
    items = sortJobs(items, query.sort);

    const totalItems = items.length;
    const start = (query.page - 1) * query.pageSize;
    const data = items.slice(start, start + query.pageSize);
    const result: Paginated<EmployerJob> = {
      data: clone(data),
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
    };
    return of(result).pipe(delay(MOCK_LATENCY));
  }

  transition(id: Id, action: JobTransition): Observable<EmployerJob> {
    if (!environment.useMock) {
      return this.api.post<EmployerJob>(`${ENDPOINT}/${id}/${action}`, {});
    }
    const job = this.jobs.find((item) => item.id === id);
    if (!job) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }

    if (action === 'duplicate') {
      const copy: EmployerJob = {
        ...clone(job),
        id: this.nextId++,
        title: `${job.title} (copy)`,
        status: JobStatus.Draft,
        approvalStage: undefined,
        applicantCount: 0,
        createdAt: new Date().toISOString(),
        publishedAt: undefined,
        expiredAt: undefined,
      };
      this.jobs = [copy, ...this.jobs];
      return of(clone(copy)).pipe(delay(MOCK_LATENCY));
    }

    const next: Record<Exclude<JobTransition, 'duplicate'>, JobStatus> = {
      pause: JobStatus.Paused,
      resume: JobStatus.Published,
      close: JobStatus.Closed,
      archive: JobStatus.Archived,
    };
    job.status = next[action];
    return of(clone(job)).pipe(delay(MOCK_LATENCY));
  }

  /** Returns an editable form value for a job (synthesized for seed jobs). */
  getFormValue(id: Id): Observable<JobFormValue> {
    if (!environment.useMock) {
      return this.api.get<JobFormValue>(`${ENDPOINT}/${id}/form`);
    }
    const stored = this.formValues.get(id);
    if (stored) {
      return of(clone(stored)).pipe(delay(MOCK_LATENCY));
    }
    const job = this.jobs.find((item) => item.id === id);
    if (!job) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    return of(this.synthFormValue(job)).pipe(delay(MOCK_LATENCY));
  }

  /** Full job detail (list meta + editable content) for the employer detail view. */
  getDetail(id: Id): Observable<EmployerJobDetail> {
    if (!environment.useMock) {
      return this.api.get<EmployerJobDetail>(`${ENDPOINT}/${id}`);
    }
    const job = this.jobs.find((item) => item.id === id);
    if (!job) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    const form = this.formValues.get(id) ?? this.synthFormValue(job);
    const detail: EmployerJobDetail = {
      ...clone(job),
      department: form.department,
      description: form.description,
      requirements: form.requirements,
      skills: form.skills,
      benefits: form.benefits,
      screeningQuestions: form.screeningQuestions,
    };
    return of(detail).pipe(delay(MOCK_LATENCY));
  }

  /** Jobs awaiting approval (for the approval queue). */
  listPending(): Observable<EmployerJob[]> {
    if (!environment.useMock) {
      return this.api.get<EmployerJob[]>(`${ENDPOINT}/pending`);
    }
    const items = this.jobs
      .filter((job) => job.status === JobStatus.PendingApproval)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return of(clone(items)).pipe(delay(MOCK_LATENCY));
  }

  /** Advances a pending job through the approval stages (manager → admin → published). */
  approve(id: Id): Observable<EmployerJob> {
    if (!environment.useMock) {
      return this.api.post<EmployerJob>(`${ENDPOINT}/${id}/approve`, {});
    }
    const job = this.jobs.find((item) => item.id === id);
    if (!job) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    if (job.approvalStage === JobApprovalStage.PendingManager) {
      job.approvalStage = JobApprovalStage.PendingAdmin;
    } else if (job.approvalStage === JobApprovalStage.PendingAdmin) {
      job.status = JobStatus.Published;
      job.approvalStage = JobApprovalStage.Approved;
      job.publishedAt = new Date().toISOString();
    }
    return of(clone(job)).pipe(delay(MOCK_LATENCY));
  }

  reject(id: Id, _reason: string): Observable<EmployerJob> {
    if (!environment.useMock) {
      return this.api.post<EmployerJob>(`${ENDPOINT}/${id}/reject`, { reason: _reason });
    }
    const job = this.jobs.find((item) => item.id === id);
    if (!job) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    job.status = JobStatus.Draft;
    job.approvalStage = JobApprovalStage.Rejected;
    return of(clone(job)).pipe(delay(MOCK_LATENCY));
  }

  private synthFormValue(job: EmployerJob): JobFormValue {
    return {
      title: job.title,
      employmentType: job.employmentType,
      workMode: job.workMode,
      seniorityLevel: job.seniorityLevel,
      location: job.location,
      description: `${job.title} opening at our company. Edit to add a full description.`,
      requirements: '- Relevant experience for the role\n- Strong collaboration and communication skills',
      skills: deriveSkills(job.title),
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency ?? 'MMK',
      benefits: ['Health insurance', 'Performance bonus'],
      screeningQuestions: deriveScreeningQuestions(job.id),
    };
  }

  create(value: JobFormValue, submit: boolean): Observable<EmployerJob> {
    if (!environment.useMock) {
      return this.api.post<EmployerJob>(ENDPOINT, { ...value, submit });
    }
    const id = this.nextId++;
    const job = this.toEmployerJob(id, value, submit, 0);
    job.ownerId = this.currentUser.user()?.id ?? 0;
    job.ownerName = this.currentUser.displayName() || 'You';
    this.jobs = [job, ...this.jobs];
    this.formValues.set(id, clone(value));
    return of(clone(job)).pipe(delay(MOCK_LATENCY));
  }

  update(id: Id, value: JobFormValue, submit: boolean): Observable<EmployerJob> {
    if (!environment.useMock) {
      return this.api.put<EmployerJob>(`${ENDPOINT}/${id}`, { ...value, submit });
    }
    const existing = this.jobs.find((item) => item.id === id);
    if (!existing) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    const updated = this.toEmployerJob(id, value, submit, existing.applicantCount);
    updated.ownerId = existing.ownerId;
    updated.ownerName = existing.ownerName;
    updated.createdAt = existing.createdAt;
    updated.publishedAt = existing.publishedAt;
    // Keep the current status unless the recruiter is (re)submitting for approval.
    if (!submit) {
      updated.status = existing.status;
      updated.approvalStage = existing.approvalStage;
    }
    this.jobs = this.jobs.map((item) => (item.id === id ? updated : item));
    this.formValues.set(id, clone(value));
    return of(clone(updated)).pipe(delay(MOCK_LATENCY));
  }

  submitForApproval(id: Id): Observable<EmployerJob> {
    if (!environment.useMock) {
      return this.api.post<EmployerJob>(`${ENDPOINT}/${id}/submit`, {});
    }
    const job = this.jobs.find((item) => item.id === id);
    if (!job) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Job not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    job.status = JobStatus.PendingApproval;
    job.approvalStage = JobApprovalStage.PendingManager;
    return of(clone(job)).pipe(delay(MOCK_LATENCY));
  }

  private toEmployerJob(id: Id, value: JobFormValue, submit: boolean, applicantCount: number): EmployerJob {
    return {
      id,
      title: value.title,
      status: submit ? JobStatus.PendingApproval : JobStatus.Draft,
      approvalStage: submit ? JobApprovalStage.PendingManager : undefined,
      employmentType: value.employmentType,
      workMode: value.workMode,
      seniorityLevel: value.seniorityLevel,
      location: value.location,
      salaryMin: value.salaryMin,
      salaryMax: value.salaryMax,
      currency: value.currency,
      applicantCount,
      ownerId: 0,
      ownerName: '',
      createdAt: new Date().toISOString(),
    };
  }
}

const SKILL_MAP: ReadonlyArray<{ match: RegExp; skills: string[] }> = [
  { match: /angular|frontend/i, skills: ['Angular', 'TypeScript', 'RxJS'] },
  { match: /backend|java|node/i, skills: ['Node.js', 'SQL', 'REST API'] },
  { match: /devops/i, skills: ['Docker', 'Kubernetes', 'AWS'] },
  { match: /design|ux/i, skills: ['Figma', 'UI/UX Design'] },
  { match: /data/i, skills: ['SQL', 'Python'] },
  { match: /qa|test/i, skills: ['Cypress', 'Jest'] },
];

function deriveSkills(title: string): JobSkillRequirement[] {
  const entry = SKILL_MAP.find((item) => item.match.test(title));
  const names = entry ? entry.skills : ['Communication', 'Problem Solving'];
  return names.map((name, index) => ({ skillId: 0, name, required: index < 2 }));
}

/** Seed screening questions for a couple of demo jobs; most jobs have none. */
function deriveScreeningQuestions(jobId: number): ScreeningQuestion[] {
  if (jobId === 301) {
    return [
      { id: 1, type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', required: true },
      { id: 2, type: ScreeningQuestionType.Numeric, prompt: 'How many years of Angular experience do you have?', required: true },
      {
        id: 3, type: ScreeningQuestionType.SingleChoice, prompt: 'What is your notice period?', required: false,
        options: ['Immediate', '2 weeks', '1 month', '2+ months'],
      },
    ];
  }
  return [];
}

function sortJobs(items: EmployerJob[], sort: JobSortOption): EmployerJob[] {
  const sorted = [...items];
  switch (sort) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'applicants':
      return sorted.sort((a, b) => b.applicantCount - a.applicantCount);
    case 'newest':
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
