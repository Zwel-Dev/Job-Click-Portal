import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { ApiError, Paginated } from '@core/models/common.model';
import { JobSummary } from '@core/models/job.model';
import { EMPLOYMENT_TYPE_LABELS, EmploymentType } from '@core/enums/employment-type.enum';
import { SENIORITY_LEVEL_LABELS, SeniorityLevel } from '@core/enums/seniority-level.enum';
import { JobSearchQuery, JobSortOption } from '../../models/job-search-query.model';
import { JobSearchService } from '../../services/job-search.service';
import { SavedJobService } from '../../services/saved-job.service';

@Component({
  selector: 'app-job-search',
  standalone: false,
  templateUrl: './job-search.component.html',
  styleUrl: './job-search.component.scss',
})
export class JobSearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobSearchService = inject(JobSearchService);
  private readonly savedJobService = inject(SavedJobService);
  private readonly toast = inject(ToastService);

  readonly employmentTypeOptions = Object.values(EmploymentType);
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly seniorityOptions = Object.values(SeniorityLevel);
  readonly seniorityLabels = SENIORITY_LEVEL_LABELS;
  readonly sortOptions: ReadonlyArray<{ value: JobSortOption; label: string }> = [
    { value: 'relevance', label: 'Most relevant' },
    { value: 'newest', label: 'Newest' },
    { value: 'salary', label: 'Highest salary' },
  ];
  readonly skeletons = [0, 1, 2, 3, 4, 5];
  readonly pageSize = 8;

  readonly industries = signal<string[]>([]);
  readonly companies = signal<string[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<Paginated<JobSummary> | null>(null);
  readonly sort = signal<JobSortOption>('relevance');
  readonly page = signal(1);
  readonly filtersOpen = signal(false);

  readonly filterForm = this.fb.group({
    keyword: [''],
    location: [''],
    salaryMin: [null as number | null],
    industry: [''],
    company: [''],
    employmentTypes: [[] as EmploymentType[]],
    seniorityLevels: [[] as SeniorityLevel[]],
    remote: [false],
  });

  constructor() {
    this.jobSearchService
      .getFilterFacets()
      .pipe(takeUntilDestroyed())
      .subscribe((facets) => {
        this.industries.set(facets.industries);
        this.companies.set(facets.companies);
      });

    // URL is the source of truth: react to query params.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.syncFromParams(params);
      this.runSearch();
    });

    // Filter edits update the URL (debounced), which re-triggers the search.
    this.filterForm.valueChanges.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => {
      this.page.set(1);
      this.updateUrl();
    });
  }

  onSortChange(value: JobSortOption): void {
    this.sort.set(value);
    this.page.set(1);
    this.updateUrl();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.updateUrl();
  }

  clearFilters(): void {
    this.filterForm.reset(
      {
        keyword: '',
        location: '',
        salaryMin: null,
        industry: '',
        company: '',
        employmentTypes: [],
        seniorityLevels: [],
        remote: false,
      },
      { emitEvent: false },
    );
    this.sort.set('relevance');
    this.page.set(1);
    this.updateUrl();
  }

  toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  runSearch(): void {
    this.loading.set(true);
    this.error.set(null);
    this.jobSearchService.search(this.buildQuery()).subscribe({
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

  onSave(job: JobSummary): void {
    const op = job.isSaved ? this.savedJobService.remove(job.id) : this.savedJobService.save(job.id);
    op.subscribe({
      next: () => {
        this.result.update((result) =>
          result
            ? { ...result, data: result.data.map((j) => (j.id === job.id ? { ...j, isSaved: !job.isSaved } : j)) }
            : result,
        );
        this.toast.success(job.isSaved ? 'Removed from saved jobs.' : 'Job saved.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private syncFromParams(params: ParamMap): void {
    this.filterForm.patchValue(
      {
        keyword: params.get('keyword') ?? '',
        location: params.get('location') ?? '',
        salaryMin: params.get('salaryMin') ? Number(params.get('salaryMin')) : null,
        industry: params.get('industry') ?? '',
        company: params.get('company') ?? '',
        employmentTypes: params.getAll('employmentTypes') as EmploymentType[],
        seniorityLevels: params.getAll('seniorityLevels') as SeniorityLevel[],
        remote: params.get('remote') === 'true',
      },
      { emitEvent: false },
    );
    this.sort.set((params.get('sort') as JobSortOption) ?? 'relevance');
    this.page.set(params.get('page') ? Number(params.get('page')) : 1);
  }

  private updateUrl(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: this.buildParams() });
  }

  private buildParams(): Params {
    const value = this.filterForm.getRawValue();
    const params: Params = {};
    if (value.keyword) params['keyword'] = value.keyword;
    if (value.location) params['location'] = value.location;
    if (value.salaryMin) params['salaryMin'] = value.salaryMin;
    if (value.industry) params['industry'] = value.industry;
    if (value.company) params['company'] = value.company;
    if (value.employmentTypes?.length) params['employmentTypes'] = value.employmentTypes;
    if (value.seniorityLevels?.length) params['seniorityLevels'] = value.seniorityLevels;
    if (value.remote) params['remote'] = 'true';
    if (this.sort() !== 'relevance') params['sort'] = this.sort();
    if (this.page() > 1) params['page'] = this.page();
    return params;
  }

  private buildQuery(): JobSearchQuery {
    const value = this.filterForm.getRawValue();
    return {
      keyword: value.keyword || undefined,
      location: value.location || undefined,
      salaryMin: value.salaryMin ?? undefined,
      industry: value.industry || undefined,
      company: value.company || undefined,
      employmentTypes: value.employmentTypes?.length ? value.employmentTypes : undefined,
      seniorityLevels: value.seniorityLevels?.length ? value.seniorityLevels : undefined,
      remote: value.remote || undefined,
      sort: this.sort(),
      page: this.page(),
      pageSize: this.pageSize,
    };
  }
}
