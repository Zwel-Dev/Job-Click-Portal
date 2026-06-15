import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiError, Id } from '@core/models/common.model';
import { Payment } from '@core/models/admin-subscription.model';
import { PAYMENT_STATUS_META } from '@core/enums/payment-status.enum';
import { formatDate, formatMoney } from '@core/utils/format';
import { AdminSubscriptionService } from '../../services/admin-subscription.service';

export interface CompanyPaymentsDialogData {
  companyId: Id;
  companyName: string;
}

/** Read-only invoices/payments for one company (PA3.0 "view invoices"). */
@Component({
  selector: 'app-company-payments-dialog',
  standalone: false,
  templateUrl: './company-payments-dialog.component.html',
  styleUrl: './company-payments-dialog.component.scss',
})
export class CompanyPaymentsDialogComponent {
  private readonly data = inject<CompanyPaymentsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CompanyPaymentsDialogComponent>);
  private readonly service = inject(AdminSubscriptionService);

  readonly companyName = this.data.companyName;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly payments = signal<Payment[]>([]);

  readonly statusMeta = PAYMENT_STATUS_META;
  readonly formatDate = formatDate;
  readonly formatMoney = formatMoney;
  readonly skeletons = [0, 1, 2];

  constructor() {
    this.load();
  }

  reload(): void {
    this.load();
  }

  close(): void {
    this.dialogRef.close();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.payments(this.data.companyId).subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load invoices.');
        this.loading.set(false);
      },
    });
  }
}
