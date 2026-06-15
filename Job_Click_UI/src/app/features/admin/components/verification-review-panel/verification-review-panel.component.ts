import { Component, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiError } from '@core/models/common.model';
import { VerificationReviewItem } from '@core/models/verification-review.model';
import { ToastService } from '@core/services/toast.service';
import { formatDate } from '@core/utils/format';
import { VerificationReviewService } from '../../services/verification-review.service';

export interface VerificationReviewPanelData {
  item: VerificationReviewItem;
}

export interface VerificationReviewPanelResult {
  reviewed: boolean;
}

/** Review panel for one pending company: inspect submission + Approve / Reject (PA1.3 §8.3). */
@Component({
  selector: 'app-verification-review-panel',
  standalone: false,
  templateUrl: './verification-review-panel.component.html',
  styleUrl: './verification-review-panel.component.scss',
})
export class VerificationReviewPanelComponent {
  private readonly data = inject<VerificationReviewPanelData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(
    MatDialogRef<VerificationReviewPanelComponent, VerificationReviewPanelResult>,
  );
  private readonly service = inject(VerificationReviewService);
  private readonly toast = inject(ToastService);

  readonly item: VerificationReviewItem = this.data.item;
  readonly busy = signal(false);
  readonly rejecting = signal(false);
  readonly reasonControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(300)],
  });

  readonly formatDate = formatDate;

  startReject(): void {
    this.rejecting.set(true);
  }

  cancelReject(): void {
    this.rejecting.set(false);
    this.reasonControl.reset();
  }

  approve(): void {
    this.busy.set(true);
    this.service.review({ companyId: this.item.companyId, approve: true }).subscribe({
      next: () => {
        this.toast.success(`${this.item.companyName} has been verified.`);
        this.dialogRef.close({ reviewed: true });
      },
      error: (error: ApiError) => {
        this.toast.error(error.message ?? 'Could not approve this company.');
        this.busy.set(false);
      },
    });
  }

  confirmReject(): void {
    if (this.reasonControl.invalid) {
      this.reasonControl.markAsTouched();
      return;
    }
    this.busy.set(true);
    this.service
      .review({ companyId: this.item.companyId, approve: false, reason: this.reasonControl.value.trim() })
      .subscribe({
        next: () => {
          this.toast.success(`${this.item.companyName} was returned for resubmission.`);
          this.dialogRef.close({ reviewed: true });
        },
        error: (error: ApiError) => {
          this.toast.error(error.message ?? 'Could not reject this company.');
          this.busy.set(false);
        },
      });
  }

  close(): void {
    this.dialogRef.close({ reviewed: false });
  }
}
