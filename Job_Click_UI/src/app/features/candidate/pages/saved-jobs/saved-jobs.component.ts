import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { JobSummary, SavedJob } from '@core/models/job.model';
import { SavedJobService } from '../../services/saved-job.service';
import { ApplyDialogComponent } from '../jobs/apply-dialog/apply-dialog.component';

@Component({
  selector: 'app-saved-jobs',
  standalone: false,
  templateUrl: './saved-jobs.component.html',
  styleUrl: './saved-jobs.component.scss',
})
export class SavedJobsComponent {
  private readonly savedJobService = inject(SavedJobService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly savedJobs = signal<SavedJob[]>([]);
  readonly skeletons = [0, 1, 2];

  constructor() {
    this.load();
  }

  reload(): void {
    this.load();
  }

  remove(job: JobSummary): void {
    const previous = this.savedJobs();
    // Optimistic: drop it immediately, restore on failure.
    this.savedJobs.update((list) => list.filter((saved) => saved.job.id !== job.id));
    this.savedJobService.remove(job.id).subscribe({
      next: () => this.toast.success('Removed from saved jobs.'),
      error: (error: ApiError) => {
        this.savedJobs.set(previous);
        this.toast.error(error.message);
      },
    });
  }

  apply(job: JobSummary): void {
    this.dialog.open(ApplyDialogComponent, { data: { job }, width: '520px', maxWidth: '94vw', autoFocus: false });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.savedJobService.list().subscribe({
      next: (list) => {
        this.savedJobs.set(list);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load saved jobs.');
        this.loading.set(false);
      },
    });
  }
}
