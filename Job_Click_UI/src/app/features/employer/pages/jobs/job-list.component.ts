import { Component, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError, Paginated } from '@core/models/common.model';
import { JOB_STATUS_META, JobStatus } from '@core/enums/job-status.enum';
import { EMPLOYMENT_TYPE_LABELS } from '@core/enums/employment-type.enum';
import { formatDate, formatSalary } from '@core/utils/format';
import { EmployerContextStore } from '../../state/employer-context.store';
import { JobService, JobTransition } from '../../services/job.service';
import { EmployerJob } from '../../models/employer-job.model';
import { JobListQuery, JobOwnerScope, JobSortOption } from '../../models/job-list-query.model';

type StatusFilter = JobStatus | 'ALL';

@Component({
  selector: 'app-job-list',
  standalone: false,
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
})
export class JobListComponent {
  private readonly jobService = inject(JobService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly context = inject(EmployerContextStore);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly result = signal<Paginated<EmployerJob> | null>(null);
  readonly statusFilter = signal<StatusFilter>('ALL');
  readonly ownerScope = signal<JobOwnerScope>('all');
  readonly sort = signal<JobSortOption>('newest');
  readonly page = signal(1);
  readonly pageSize = 8;
  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly jobStatusMeta = JOB_STATUS_META;
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly formatDate = formatDate;
  readonly formatSalary = formatSalary;
  readonly JobStatus = JobStatus;
  readonly skeletons = [0, 1, 2, 3];

  readonly statusOptions: ReadonlyArray<{ value: StatusFilter; label: string }> = [
    { value: 'ALL', label: 'All statuses' },
    ...Object.values(JobStatus).map((status) => ({ value: status, label: JOB_STATUS_META[status].label })),
  ];

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });
    this.load();
  }

  onStatusChange(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.load();
  }

  onOwnerChange(value: JobOwnerScope): void {
    this.ownerScope.set(value);
    this.page.set(1);
    this.load();
  }

  onSortChange(value: JobSortOption): void {
    this.sort.set(value);
    this.page.set(1);
    this.load();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  reload(): void {
    this.load();
  }

  pause(job: EmployerJob): void {
    this.run(job, 'pause', 'Job paused.');
  }
  resume(job: EmployerJob): void {
    this.run(job, 'resume', 'Job resumed.');
  }
  duplicate(job: EmployerJob): void {
    this.run(job, 'duplicate', 'Job duplicated as a draft.');
  }

  close(job: EmployerJob): void {
    this.confirmThen(job, 'close', 'Close job', `Close "${job.title}"? It will stop accepting applications.`, 'Job closed.');
  }
  archive(job: EmployerJob): void {
    this.confirmThen(job, 'archive', 'Archive job', `Archive "${job.title}"?`, 'Job archived.');
  }

  private confirmThen(
    job: EmployerJob,
    action: JobTransition,
    title: string,
    message: string,
    successMessage: string,
  ): void {
    this.confirm
      .confirm({ title, message, confirmLabel: title.split(' ')[0], danger: true })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.run(job, action, successMessage);
        }
      });
  }

  private run(job: EmployerJob, action: JobTransition, successMessage: string): void {
    this.jobService.transition(job.id, action).subscribe({
      next: () => {
        this.toast.success(successMessage);
        this.load();
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    const status = this.statusFilter();
    const query: JobListQuery = {
      status: status === 'ALL' ? undefined : status,
      ownerScope: this.ownerScope(),
      keyword: this.searchControl.value || undefined,
      sort: this.sort(),
      page: this.page(),
      pageSize: this.pageSize,
    };
    this.jobService.list(query).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load jobs.');
        this.loading.set(false);
      },
    });
  }
}
