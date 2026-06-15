import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiError } from '@core/models/common.model';
import { VerificationReviewItem } from '@core/models/verification-review.model';
import { formatDate } from '@core/utils/format';
import { AdminContextStore } from '../../state/admin-context.store';
import { VerificationReviewService } from '../../services/verification-review.service';
import {
  VerificationReviewPanelComponent,
  VerificationReviewPanelData,
  VerificationReviewPanelResult,
} from '../../components/verification-review-panel/verification-review-panel.component';

/** Verification inbox — companies awaiting review; opens the review panel (PA1.3 §8.3). */
@Component({
  selector: 'app-verification-queue',
  standalone: false,
  templateUrl: './verification-queue.component.html',
  styleUrl: './verification-queue.component.scss',
})
export class VerificationQueueComponent {
  private readonly service = inject(VerificationReviewService);
  private readonly context = inject(AdminContextStore);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly queue = signal<VerificationReviewItem[]>([]);

  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2];

  constructor() {
    this.load();
  }

  review(item: VerificationReviewItem): void {
    const data: VerificationReviewPanelData = { item };
    this.dialog
      .open<VerificationReviewPanelComponent, VerificationReviewPanelData, VerificationReviewPanelResult>(
        VerificationReviewPanelComponent,
        { data, width: '560px', maxWidth: '94vw', maxHeight: '92vh', autoFocus: false },
      )
      .afterClosed()
      .subscribe((result) => {
        if (result?.reviewed) {
          this.load();
          // Decision changed the pending count — refresh the shell nav badge.
          this.context.reload();
        }
      });
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.queue().subscribe({
      next: (items) => {
        this.queue.set(items);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load the verification queue.');
        this.loading.set(false);
      },
    });
  }
}
