import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import {
  APPLICATION_STATUS_META,
  ApplicationStatus,
  PIPELINE_BOARD_STAGES,
  StatusTone,
} from '@core/enums/application-status.enum';
import { ApplicantSummary } from '@core/models/applicant.model';
import { formatDate } from '@core/utils/format';
import { JobService } from '../../services/job.service';
import { ApplicantService } from '../../services/applicant.service';

interface PipelineColumn {
  status: ApplicationStatus;
  label: string;
  tone: StatusTone;
  applicants: ApplicantSummary[];
}

@Component({
  selector: 'app-pipeline-board',
  standalone: false,
  templateUrl: './pipeline-board.component.html',
  styleUrl: './pipeline-board.component.scss',
})
export class PipelineBoardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly jobService = inject(JobService);
  private readonly applicantService = inject(ApplicantService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly jobTitle = signal('');
  readonly columns = signal<PipelineColumn[]>([]);

  readonly formatDate = formatDate;

  jobId = 0;

  readonly total = computed(() => this.columns().reduce((sum, column) => sum + column.applicants.length, 0));
  readonly connectedLists = computed(() => this.columns().map((column) => dropListId(column.status)));

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.jobId = Number(params.get('id'));
      this.load();
    });
  }

  reload(): void {
    this.load();
  }

  listId(status: ApplicationStatus): string {
    return dropListId(status);
  }

  drop(event: CdkDragDrop<ApplicantSummary[]>, target: PipelineColumn): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const applicant = event.previousContainer.data[event.previousIndex];
    const fromStatus = applicant.status;
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    applicant.status = target.status;

    this.applicantService.moveStage(applicant.applicationId, target.status).subscribe({
      next: () => this.toast.success(`${applicant.fullName} moved to ${target.label}.`),
      error: (error: ApiError) => {
        // Revert the optimistic move.
        const back = this.columns().find((column) => column.status === fromStatus);
        const index = event.container.data.indexOf(applicant);
        if (back && index > -1) {
          transferArrayItem(event.container.data, back.applicants, index, back.applicants.length);
        }
        applicant.status = fromStatus;
        this.toast.error(error.message);
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.columns.set([]);
    forkJoin({
      job: this.jobService.getDetail(this.jobId),
      applicants: this.applicantService.pipeline(this.jobId),
    }).subscribe({
      next: ({ job, applicants }) => {
        this.jobTitle.set(job.title);
        this.columns.set(this.toColumns(applicants));
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load the pipeline.');
        this.loading.set(false);
      },
    });
  }

  private toColumns(applicants: ApplicantSummary[]): PipelineColumn[] {
    return PIPELINE_BOARD_STAGES.map((status) => ({
      status,
      label: APPLICATION_STATUS_META[status].label,
      tone: APPLICATION_STATUS_META[status].tone,
      applicants: applicants.filter((applicant) => applicant.status === status),
    }));
  }
}

function dropListId(status: ApplicationStatus): string {
  return `pipeline-${status}`;
}
