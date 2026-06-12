import { Component, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { JOB_STATUS_META } from '@core/enums/job-status.enum';
import { JOB_APPROVAL_STAGE_META, JobApprovalStage } from '@core/enums/job-approval-stage.enum';
import { EMPLOYMENT_TYPE_LABELS } from '@core/enums/employment-type.enum';
import { WORK_MODE_LABELS } from '@core/enums/work-mode.enum';
import { formatDate, formatSalary } from '@core/utils/format';
import { EmployerContextStore } from '../../state/employer-context.store';
import { JobApprovalService } from '../../services/job-approval.service';
import { EmployerJob } from '../../models/employer-job.model';

@Component({
  selector: 'app-job-approval-queue',
  standalone: false,
  templateUrl: './job-approval-queue.component.html',
  styleUrl: './job-approval-queue.component.scss',
})
export class JobApprovalQueueComponent {
  private readonly approvalService = inject(JobApprovalService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly context = inject(EmployerContextStore);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly jobs = signal<EmployerJob[]>([]);
  readonly acting = signal<number | null>(null);

  readonly jobStatusMeta = JOB_STATUS_META;
  readonly approvalStageMeta = JOB_APPROVAL_STAGE_META;
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly workModeLabels = WORK_MODE_LABELS;
  readonly formatDate = formatDate;
  readonly formatSalary = formatSalary;
  readonly skeletons = [0, 1, 2];

  constructor() {
    this.load();
  }

  reload(): void {
    this.load();
  }

  /** True when the signed-in user can act on this job's current approval stage. */
  canActOn(job: EmployerJob): boolean {
    if (job.approvalStage === JobApprovalStage.PendingManager) {
      return this.context.isManager();
    }
    if (job.approvalStage === JobApprovalStage.PendingAdmin) {
      return this.context.isCompanyAdmin();
    }
    return false;
  }

  approve(job: EmployerJob): void {
    this.acting.set(job.id);
    this.approvalService.approve(job.id).subscribe({
      next: () => {
        this.toast.success(`"${job.title}" approved.`);
        this.acting.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.toast.error(error.message);
        this.acting.set(null);
      },
    });
  }

  reject(job: EmployerJob): void {
    this.confirm
      .confirm({
        title: 'Reject job',
        message: `Reject "${job.title}"? It returns to the recruiter as a draft.`,
        confirmLabel: 'Reject',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.acting.set(job.id);
        this.approvalService.reject(job.id, 'Returned for revision.').subscribe({
          next: () => {
            this.toast.success(`"${job.title}" rejected.`);
            this.acting.set(null);
            this.load();
          },
          error: (error: ApiError) => {
            this.toast.error(error.message);
            this.acting.set(null);
          },
        });
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.approvalService.queue().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load the approval queue.');
        this.loading.set(false);
      },
    });
  }
}
