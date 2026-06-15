import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiError, Paginated } from '@core/models/common.model';
import { AdminCompany } from '@core/models/admin-company.model';
import { CompanyStatus, COMPANY_STATUS_META } from '@core/enums/company-status.enum';
import { VERIFICATION_STATUS_META } from '@core/enums/verification-status.enum';
import { formatDate } from '@core/utils/format';
import { AdminCompanyService } from '../../services/admin-company.service';
import { AdminCompanyActionsService } from '../../services/admin-company-actions.service';

interface VerifiedOption {
  label: string;
  value: boolean | null;
}

/** Platform company directory — search / filter / paginate, with row actions (PA1.2 §8.2). */
@Component({
  selector: 'app-company-management',
  standalone: false,
  templateUrl: './company-management.component.html',
  styleUrl: './company-management.component.scss',
})
export class CompanyManagementComponent {
  private readonly service = inject(AdminCompanyService);
  private readonly actions = inject(AdminCompanyActionsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly result = signal<Paginated<AdminCompany> | null>(null);

  readonly keywordControl = new FormControl('', { nonNullable: true });
  readonly status = signal<CompanyStatus | null>(null);
  readonly verified = signal<boolean | null>(null);
  readonly page = signal(1);
  readonly pageSize = 8;

  readonly statusMeta = COMPANY_STATUS_META;
  readonly verificationMeta = VERIFICATION_STATUS_META;
  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2, 3, 4, 5];

  readonly statusOptions = Object.values(CompanyStatus).map((value) => ({
    value,
    label: COMPANY_STATUS_META[value].label,
  }));
  readonly verifiedOptions: VerifiedOption[] = [
    { label: 'All', value: null },
    { label: 'Verified', value: true },
    { label: 'Not verified', value: false },
  ];

  readonly hasFilters = computed(
    () => !!this.keywordControl.value || this.status() !== null || this.verified() !== null,
  );

  constructor() {
    this.keywordControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndLoad());
    this.load();
  }

  isSuspended(company: AdminCompany): boolean {
    return company.status === CompanyStatus.Suspended;
  }

  onStatusChange(value: CompanyStatus | null): void {
    this.status.set(value);
    this.resetAndLoad();
  }

  onVerifiedChange(value: boolean | null): void {
    this.verified.set(value);
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  clearFilters(): void {
    this.keywordControl.setValue('', { emitEvent: false });
    this.status.set(null);
    this.verified.set(null);
    this.resetAndLoad();
  }

  /** Quick row action: suspend / activate without leaving the list. */
  toggleStatus(company: AdminCompany): void {
    this.actions.toggleStatus(company).subscribe((updated) => {
      if (updated) {
        this.load();
      }
    });
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
    this.service
      .list({
        keyword: this.keywordControl.value || undefined,
        status: this.status() ?? undefined,
        verified: this.verified() ?? undefined,
        page: this.page(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
        },
        error: (error: ApiError) => {
          this.error.set(error.message ?? 'Failed to load companies.');
          this.loading.set(false);
        },
      });
  }
}
