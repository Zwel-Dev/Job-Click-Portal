import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiError, Paginated } from '@core/models/common.model';
import { AdminSubscription, BillingSummary } from '@core/models/admin-subscription.model';
import { SubscriptionStatus, SUBSCRIPTION_STATUS_META } from '@core/enums/subscription-status.enum';
import { formatDate, formatMoney } from '@core/utils/format';
import { AdminSubscriptionService } from '../../services/admin-subscription.service';
import {
  CompanyPaymentsDialogComponent,
  CompanyPaymentsDialogData,
} from '../../components/company-payments-dialog/company-payments-dialog.component';

/** Subscription oversight — all company subscriptions + invoices, read-only (PA3.0 §8.9). */
@Component({
  selector: 'app-subscription-oversight',
  standalone: false,
  templateUrl: './subscription-oversight.component.html',
  styleUrl: './subscription-oversight.component.scss',
})
export class SubscriptionOversightComponent {
  private readonly service = inject(AdminSubscriptionService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly result = signal<Paginated<AdminSubscription> | null>(null);
  readonly summary = signal<BillingSummary | null>(null);

  readonly keywordControl = new FormControl('', { nonNullable: true });
  readonly plan = signal<string | null>(null);
  readonly status = signal<SubscriptionStatus | null>(null);
  readonly page = signal(1);
  readonly pageSize = 8;

  readonly statusMeta = SUBSCRIPTION_STATUS_META;
  readonly formatDate = formatDate;
  readonly formatMoney = formatMoney;
  readonly skeletons = [0, 1, 2, 3, 4, 5];

  readonly planOptions = ['Free', 'Pro', 'Enterprise'];
  readonly statusOptions = Object.values(SubscriptionStatus).map((value) => ({
    value,
    label: SUBSCRIPTION_STATUS_META[value].label,
  }));

  readonly hasFilters = computed(
    () => !!this.keywordControl.value || this.plan() !== null || this.status() !== null,
  );

  constructor() {
    this.keywordControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndLoad());
    this.loadSummary();
    this.load();
  }

  onPlanChange(value: string | null): void {
    this.plan.set(value);
    this.resetAndLoad();
  }

  onStatusChange(value: SubscriptionStatus | null): void {
    this.status.set(value);
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  clearFilters(): void {
    this.keywordControl.setValue('', { emitEvent: false });
    this.plan.set(null);
    this.status.set(null);
    this.resetAndLoad();
  }

  viewPayments(sub: AdminSubscription): void {
    const data: CompanyPaymentsDialogData = { companyId: sub.companyId, companyName: sub.companyName };
    this.dialog.open(CompanyPaymentsDialogComponent, { data, width: '520px', maxWidth: '94vw', maxHeight: '90vh', autoFocus: false });
  }

  reload(): void {
    this.load();
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.load();
  }

  private loadSummary(): void {
    this.service.summary().subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => this.summary.set(null),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .list({
        keyword: this.keywordControl.value || undefined,
        planName: this.plan() ?? undefined,
        status: this.status() ?? undefined,
        page: this.page(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
        },
        error: (error: ApiError) => {
          this.error.set(error.message ?? 'Failed to load subscriptions.');
          this.loading.set(false);
        },
      });
  }
}
