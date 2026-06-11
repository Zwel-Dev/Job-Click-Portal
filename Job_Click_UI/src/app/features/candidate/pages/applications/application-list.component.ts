import { Component, computed, inject, signal } from '@angular/core';
import { ApiError } from '@core/models/common.model';
import { Application } from '@core/models/application.model';
import { APPLICATION_STATUS_META, ApplicationStatus } from '@core/enums/application-status.enum';
import { formatDate } from '@core/utils/format';
import { ApplicationService } from '../../services/application.service';

type SortOrder = 'newest' | 'oldest';
type StatusFilter = ApplicationStatus | 'ALL';

@Component({
  selector: 'app-application-list',
  standalone: false,
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
})
export class ApplicationListComponent {
  private readonly applicationService = inject(ApplicationService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly all = signal<Application[]>([]);
  readonly statusFilter = signal<StatusFilter>('ALL');
  readonly sort = signal<SortOrder>('newest');
  readonly page = signal(1);
  readonly pageSize = 8;
  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2, 3];

  readonly statusOptions: ReadonlyArray<{ value: StatusFilter; label: string }> = [
    { value: 'ALL', label: 'All statuses' },
    ...Object.values(ApplicationStatus).map((status) => ({
      value: status,
      label: APPLICATION_STATUS_META[status].label,
    })),
  ];

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    const list = status === 'ALL' ? this.all() : this.all().filter((app) => app.status === status);
    return [...list].sort((a, b) =>
      this.sort() === 'newest' ? b.appliedAt.localeCompare(a.appliedAt) : a.appliedAt.localeCompare(b.appliedAt),
    );
  });
  readonly total = computed(() => this.filtered().length);
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  constructor() {
    this.load();
  }

  reload(): void {
    this.load();
  }

  onFilterChange(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.page.set(1);
  }

  onSortChange(value: SortOrder): void {
    this.sort.set(value);
    this.page.set(1);
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.applicationService.list().subscribe({
      next: (list) => {
        this.all.set(list);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load applications.');
        this.loading.set(false);
      },
    });
  }
}
