import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { Job } from '@core/models/job.model';
import { Application } from '@core/models/application.model';
import { EMPLOYMENT_TYPE_LABELS } from '@core/enums/employment-type.enum';
import { WORK_MODE_LABELS } from '@core/enums/work-mode.enum';
import { SENIORITY_LEVEL_LABELS } from '@core/enums/seniority-level.enum';
import { formatDate, formatSalary } from '@core/utils/format';
import { JobSearchService } from '../../services/job-search.service';
import { ApplicationService } from '../../services/application.service';
import { SavedJobService } from '../../services/saved-job.service';
import { ApplyDialogComponent } from './apply-dialog/apply-dialog.component';

@Component({
  selector: 'app-job-detail',
  standalone: false,
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class JobDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly jobSearchService = inject(JobSearchService);
  private readonly applicationService = inject(ApplicationService);
  private readonly savedJobService = inject(SavedJobService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly job = signal<Job | null>(null);
  readonly application = signal<Application | null>(null);

  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly workModeLabels = WORK_MODE_LABELS;
  readonly seniorityLabels = SENIORITY_LEVEL_LABELS;
  readonly formatSalary = formatSalary;
  readonly formatDate = formatDate;

  private currentId = 0;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.currentId = Number(params.get('id'));
      this.load();
    });
  }

  reload(): void {
    this.load();
  }

  toggleSave(): void {
    const job = this.job();
    if (!job) {
      return;
    }
    const op = job.isSaved ? this.savedJobService.remove(job.id) : this.savedJobService.save(job.id);
    op.subscribe({
      next: () => {
        this.job.update((current) => (current ? { ...current, isSaved: !job.isSaved } : current));
        this.toast.success(job.isSaved ? 'Removed from saved jobs.' : 'Job saved.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  apply(): void {
    const job = this.job();
    if (!job) {
      return;
    }
    this.dialog
      .open(ApplyDialogComponent, { data: { job }, width: '520px', maxWidth: '94vw', autoFocus: false })
      .afterClosed()
      .subscribe((application: Application | null | undefined) => {
        if (application) {
          this.application.set(application);
        }
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.job.set(null);
    this.application.set(null);
    forkJoin({
      job: this.jobSearchService.getById(this.currentId),
      application: this.applicationService.findByJob(this.currentId),
    }).subscribe({
      next: ({ job, application }) => {
        this.job.set(job);
        this.application.set(application);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'This job could not be found.');
        this.loading.set(false);
      },
    });
  }
}
