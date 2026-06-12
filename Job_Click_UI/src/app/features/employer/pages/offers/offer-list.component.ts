import { Component, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { OFFER_STATUS_META, OfferStatus } from '@core/enums/offer-status.enum';
import { Offer } from '@core/models/offer.model';
import { formatDate } from '@core/utils/format';
import { OfferService } from '../../services/offer.service';

type StatusFilter = OfferStatus | 'ALL';

@Component({
  selector: 'app-offer-list',
  standalone: false,
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.scss',
})
export class OfferListComponent {
  private readonly offerService = inject(OfferService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly offers = signal<Offer[]>([]);
  readonly statusFilter = signal<StatusFilter>('ALL');
  readonly acting = signal<number | null>(null);

  readonly statusMeta = OFFER_STATUS_META;
  readonly formatDate = formatDate;
  readonly OfferStatus = OfferStatus;
  readonly skeletons = [0, 1, 2];

  readonly statusOptions: ReadonlyArray<{ value: StatusFilter; label: string }> = [
    { value: 'ALL', label: 'All statuses' },
    ...Object.values(OfferStatus).map((status) => ({ value: status, label: OFFER_STATUS_META[status].label })),
  ];

  constructor() {
    this.load();
  }

  reload(): void {
    this.load();
  }

  onStatusChange(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.load();
  }

  send(offer: Offer): void {
    this.run(offer, OfferStatus.Sent, 'Offer sent.');
  }
  accept(offer: Offer): void {
    this.run(offer, OfferStatus.Accepted, 'Offer marked as accepted.');
  }
  reject(offer: Offer): void {
    this.run(offer, OfferStatus.Rejected, 'Offer marked as rejected.');
  }

  withdraw(offer: Offer): void {
    this.confirm
      .confirm({
        title: 'Withdraw offer',
        message: `Withdraw the offer to ${offer.candidateName}?`,
        confirmLabel: 'Withdraw',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.run(offer, OfferStatus.Withdrawn, 'Offer withdrawn.');
        }
      });
  }

  private run(offer: Offer, status: OfferStatus, message: string): void {
    this.acting.set(offer.id);
    this.offerService.updateStatus(offer.id, status).subscribe({
      next: () => {
        this.toast.success(message);
        this.acting.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.toast.error(error.message);
        this.acting.set(null);
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    const status = this.statusFilter();
    this.offerService.list(status === 'ALL' ? undefined : status).subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load offers.');
        this.loading.set(false);
      },
    });
  }
}
