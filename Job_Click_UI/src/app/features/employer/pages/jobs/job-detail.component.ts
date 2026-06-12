import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { JOB_STATUS_META, JobStatus } from '@core/enums/job-status.enum';
import { JOB_APPROVAL_STAGE_META, JobApprovalStage } from '@core/enums/job-approval-stage.enum';
import { EMPLOYMENT_TYPE_LABELS } from '@core/enums/employment-type.enum';
import { WORK_MODE_LABELS } from '@core/enums/work-mode.enum';
import { SENIORITY_LEVEL_LABELS } from '@core/enums/seniority-level.enum';
import { SCREENING_QUESTION_TYPE_LABELS } from '@core/enums/screening-question-type.enum';
import { formatDate, formatSalary } from '@core/utils/format';
import { EmployerContextStore } from '../../state/employer-context.store';
import { JobService, JobTransition } from '../../services/job.service';
import { JobApprovalService } from '../../services/job-approval.service';
import { EmployerJobDetail } from '../../models/employer-job-detail.model';

@Component({
  selector: 'app-employer-job-detail',
  standalone: false,
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class EmployerJobDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly jobService = inject(JobService);
  private readonly approvalService = inject(JobApprovalService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  readonly context = inject(EmployerContextStore);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly job = signal<EmployerJobDetail | null>(null);

  readonly jobStatusMeta = JOB_STATUS_META;
  readonly approvalStageMeta = JOB_APPROVAL_STAGE_META;
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly workModeLabels = WORK_MODE_LABELS;
  readonly seniorityLabels = SENIORITY_LEVEL_LABELS;
  readonly screeningTypeLabels = SCREENING_QUESTION_TYPE_LABELS;
  readonly formatDate = formatDate;
  readonly formatSalary = formatSalary;
  readonly JobStatus = JobStatus;

  private currentId = 0;

  readonly canApprove = computed(() => {
    const job = this.job();
    if (!job || job.status !== JobStatus.PendingApproval) {
      return false;
    }
    if (job.approvalStage === JobApprovalStage.PendingManager) {
      return this.context.isManager();
    }
    if (job.approvalStage === JobApprovalStage.PendingAdmin) {
      return this.context.isCompanyAdmin();
    }
    return false;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.currentId = Number(params.get('id'));
      this.load();
    });
  }

  reload(): void {
    this.load();
  }

  duplicate(): void {
    this.transition('duplicate', 'Job duplicated as a draft.');
  }
  pause(): void {
    this.transition('pause', 'Job paused.');
  }
  resume(): void {
    this.transition('resume', 'Job resumed.');
  }
  close(): void {
    this.confirmTransition('close', 'Close job', `Close "${this.job()?.title}"? It will stop accepting applications.`, 'Job closed.');
  }
  archive(): void {
    this.confirmTransition('archive', 'Archive job', `Archive "${this.job()?.title}"?`, 'Job archived.');
  }

  submitForApproval(): void {
    this.jobService.submitForApproval(this.currentId).subscribe({
      next: () => {
        this.toast.success('Job submitted for approval.');
        this.load();
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  approve(): void {
    this.approvalService.approve(this.currentId).subscribe({
      next: () => {
        this.toast.success('Job approved.');
        this.load();
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  reject(): void {
    this.confirm
      .confirm({
        title: 'Reject job',
        message: `Reject "${this.job()?.title}"? It returns to the recruiter as a draft.`,
        confirmLabel: 'Reject',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.approvalService.reject(this.currentId, 'Returned for revision.').subscribe({
          next: () => {
            this.toast.success('Job rejected.');
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  private transition(action: JobTransition, message: string): void {
    this.jobService.transition(this.currentId, action).subscribe({
      next: () => {
        this.toast.success(message);
        this.load();
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private confirmTransition(action: JobTransition, title: string, message: string, successMessage: string): void {
    this.confirm
      .confirm({ title, message, confirmLabel: title.split(' ')[0], danger: true })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.transition(action, successMessage);
        }
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.job.set(null);
    this.jobService.getDetail(this.currentId).subscribe({
      next: (job) => {
        this.job.set(job);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'This job could not be found.');
        this.loading.set(false);
      },
    });
  }
}
