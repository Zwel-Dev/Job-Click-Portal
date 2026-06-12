import { Component, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiError, Paginated } from '@core/models/common.model';
import { StatusTone } from '@core/enums/application-status.enum';
import { SENIORITY_LEVEL_LABELS, SeniorityLevel } from '@core/enums/seniority-level.enum';
import { WORK_MODE_LABELS } from '@core/enums/work-mode.enum';
import { AVAILABILITY_STATUS_LABELS, AvailabilityStatus } from '@core/enums/availability-status.enum';
import { formatSalary } from '@core/utils/format';
import { CandidateSearchService } from '../../services/candidate-search.service';
import {
  CandidateSearchQuery,
  CandidateSearchResult,
  CandidateSortOption,
} from '../../models/candidate-search.model';
import { AddToPoolData, AddToPoolDialogComponent } from '../talent-pools/add-to-pool-dialog.component';

const AVAILABILITY_TONE: Record<AvailabilityStatus, StatusTone> = {
  [AvailabilityStatus.OpenToWork]: 'success',
  [AvailabilityStatus.Employed]: 'info',
  [AvailabilityStatus.NotLooking]: 'neutral',
};

@Component({
  selector: 'app-candidate-search',
  standalone: false,
  templateUrl: './candidate-search.component.html',
  styleUrl: './candidate-search.component.scss',
})
export class CandidateSearchComponent {
  private readonly searchService = inject(CandidateSearchService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly result = signal<Paginated<CandidateSearchResult> | null>(null);

  readonly keywordControl = new FormControl('', { nonNullable: true });
  readonly locationControl = new FormControl('', { nonNullable: true });
  readonly seniority = signal<SeniorityLevel[]>([]);
  readonly availability = signal<AvailabilityStatus[]>([]);
  readonly remoteOnly = signal(false);
  readonly sort = signal<CandidateSortOption>('recent');
  readonly page = signal(1);
  readonly pageSize = 6;

  readonly seniorityLabels = SENIORITY_LEVEL_LABELS;
  readonly availabilityLabels = AVAILABILITY_STATUS_LABELS;
  readonly workModeLabels = WORK_MODE_LABELS;
  readonly availabilityTone = AVAILABILITY_TONE;
  readonly formatSalary = formatSalary;
  readonly skeletons = [0, 1, 2, 3];

  readonly seniorityOptions = Object.values(SeniorityLevel).map((value) => ({
    value,
    label: SENIORITY_LEVEL_LABELS[value],
  }));
  readonly availabilityOptions = Object.values(AvailabilityStatus).map((value) => ({
    value,
    label: AVAILABILITY_STATUS_LABELS[value],
  }));

  constructor() {
    this.keywordControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndLoad());
    this.locationControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndLoad());
    this.load();
  }

  onSeniorityChange(value: SeniorityLevel[]): void {
    this.seniority.set(value);
    this.resetAndLoad();
  }

  onAvailabilityChange(value: AvailabilityStatus[]): void {
    this.availability.set(value);
    this.resetAndLoad();
  }

  onRemoteToggle(value: boolean): void {
    this.remoteOnly.set(value);
    this.resetAndLoad();
  }

  onSortChange(value: CandidateSortOption): void {
    this.sort.set(value);
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  addToPool(candidate: CandidateSearchResult): void {
    const data: AddToPoolData = { candidateId: candidate.candidateId, candidateName: candidate.fullName };
    this.dialog.open(AddToPoolDialogComponent, { data, width: '440px' });
  }

  reload(): void {
    this.load();
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    const query: CandidateSearchQuery = {
      keyword: this.keywordControl.value || undefined,
      location: this.locationControl.value || undefined,
      seniorityLevels: this.seniority().length ? this.seniority() : undefined,
      availability: this.availability().length ? this.availability() : undefined,
      remoteOnly: this.remoteOnly() || undefined,
      sort: this.sort(),
      page: this.page(),
      pageSize: this.pageSize,
    };
    this.searchService.search(query).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to search candidates.');
        this.loading.set(false);
      },
    });
  }
}
