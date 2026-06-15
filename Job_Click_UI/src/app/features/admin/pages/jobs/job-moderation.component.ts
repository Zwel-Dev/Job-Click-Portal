import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiError, Paginated } from '@core/models/common.model';
import { ModeratedJob } from '@core/models/admin-platform.model';
import { JobStatus, JOB_STATUS_META } from '@core/enums/job-status.enum';
import { formatDate } from '@core/utils/format';
import { ConfirmService } from '@shared/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { JobModerationService } from '../../services/job-moderation.service';
import { FlaggedFilter, ModeratedJobGroup } from '../../models/job-moderation.model';
import {
  FlagJobDialogComponent,
  FlagJobDialogData,
} from '../../components/flag-job-dialog/flag-job-dialog.component';

type ModerationView = 'all' | 'duplicates';

/** Job moderation — flag / unflag / remove with duplicate grouping (PA2.0 §8.4). */
@Component({
  selector: 'app-job-moderation',
  standalone: false,
  templateUrl: './job-moderation.component.html',
  styleUrl: './job-moderation.component.scss',
})
export class JobModerationComponent {
  private readonly service = inject(JobModerationService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly view = signal<ModerationView>('all');

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly result = signal<Paginated<ModeratedJob> | null>(null);

  readonly dupLoading = signal(false);
  readonly dupError = signal<string | null>(null);
  readonly groups = signal<ModeratedJobGroup[]>([]);

  readonly keywordControl = new FormControl('', { nonNullable: true });
  readonly status = signal<JobStatus | null>(null);
  readonly flagged = signal<FlaggedFilter>('all');
  readonly page = signal(1);
  readonly pageSize = 8;

  readonly statusMeta = JOB_STATUS_META;
  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2, 3, 4, 5];

  readonly statusOptions = Object.values(JobStatus).map((value) => ({
    value,
    label: JOB_STATUS_META[value].label,
  }));
  readonly flaggedOptions: { label: string; value: FlaggedFilter }[] = [
    { label: 'All jobs', value: 'all' },
    { label: 'Flagged', value: 'flagged' },
    { label: 'Not flagged', value: 'unflagged' },
  ];

  readonly hasFilters = computed(
    () => !!this.keywordControl.value || this.status() !== null || this.flagged() !== 'all',
  );

  constructor() {
    this.keywordControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndLoad());
    this.load();
  }

  /** The original plus its duplicates, as one list for the grouped view. */
  allInGroup(group: ModeratedJobGroup): ModeratedJob[] {
    return [group.original, ...group.duplicates];
  }

  setView(view: ModerationView): void {
    if (this.view() === view) {
      return;
    }
    this.view.set(view);
    if (view === 'duplicates') {
      this.loadDuplicates();
    } else {
      this.load();
    }
  }

  onStatusChange(value: JobStatus | null): void {
    this.status.set(value);
    this.resetAndLoad();
  }

  onFlaggedChange(value: FlaggedFilter): void {
    this.flagged.set(value);
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  clearFilters(): void {
    this.keywordControl.setValue('', { emitEvent: false });
    this.status.set(null);
    this.flagged.set('all');
    this.resetAndLoad();
  }

  // --- Actions (shared by the list and the duplicate groups) ---------------

  flag(job: ModeratedJob): void {
    const data: FlagJobDialogData = { jobTitle: job.title, currentReason: job.flagReason };
    this.dialog
      .open<FlagJobDialogComponent, FlagJobDialogData, string | null>(FlagJobDialogComponent, {
        data,
        width: '460px',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((reason) => {
        if (reason) {
          this.service.flag(job.id, reason).subscribe({
            next: () => {
              this.toast.success(`"${job.title}" was flagged.`);
              this.refresh();
            },
            error: (error: ApiError) => this.toast.error(error.message ?? 'Could not flag the job.'),
          });
        }
      });
  }

  unflag(job: ModeratedJob): void {
    this.service.unflag(job.id).subscribe({
      next: () => {
        this.toast.success(`"${job.title}" is no longer flagged.`);
        this.refresh();
      },
      error: (error: ApiError) => this.toast.error(error.message ?? 'Could not unflag the job.'),
    });
  }

  remove(job: ModeratedJob): void {
    this.confirm
      .confirm({
        title: `Remove "${job.title}"?`,
        message: `This takes the posting down across the platform. Candidates can no longer see or apply to it. This cannot be undone.`,
        confirmLabel: 'Remove job',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.remove(job.id).subscribe({
          next: () => {
            this.toast.success(`"${job.title}" was removed.`);
            this.refresh();
          },
          error: (error: ApiError) => this.toast.error(error.message ?? 'Could not remove the job.'),
        });
      });
  }

  reload(): void {
    this.load();
  }

  reloadDuplicates(): void {
    this.loadDuplicates();
  }

  private refresh(): void {
    if (this.view() === 'duplicates') {
      this.loadDuplicates();
    } else {
      this.load();
    }
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .list({
        keyword: this.keywordControl.value || undefined,
        status: this.status() ?? undefined,
        flagged: this.flagged(),
        page: this.page(),
        pageSize: this.pageSize,
      })
      .subscribe({
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

  private loadDuplicates(): void {
    this.dupLoading.set(true);
    this.dupError.set(null);
    this.service.duplicates().subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.dupLoading.set(false);
      },
      error: (error: ApiError) => {
        this.dupError.set(error.message ?? 'Failed to load duplicates.');
        this.dupLoading.set(false);
      },
    });
  }
}
