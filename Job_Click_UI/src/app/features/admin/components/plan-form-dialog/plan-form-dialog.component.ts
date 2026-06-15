import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubscriptionPlan } from '@core/models/subscription.model';
import { PlanFormValue } from '../../models/platform-settings.model';

export interface PlanFormDialogData {
  plan?: SubscriptionPlan;
}

/** Add / edit a subscription plan. Resolves to the form value, or null if cancelled. */
@Component({
  selector: 'app-plan-form-dialog',
  standalone: false,
  templateUrl: './plan-form-dialog.component.html',
  styleUrl: './plan-form-dialog.component.scss',
})
export class PlanFormDialogComponent {
  readonly data = inject<PlanFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PlanFormDialogComponent, PlanFormValue | null>);
  private readonly fb = inject(FormBuilder);

  readonly isEdit = !!this.data.plan;

  readonly form = this.fb.nonNullable.group({
    name: [this.data.plan?.name ?? '', [Validators.required, Validators.maxLength(40)]],
    price: [this.data.plan?.price ?? 0, [Validators.required, Validators.min(0)]],
    maxJobs: [this.data.plan?.maxJobs ?? 1, [Validators.required, Validators.min(1)]],
    maxRecruiters: [this.data.plan?.maxRecruiters ?? 1, [Validators.required, Validators.min(1)]],
    candidateSearch: [this.data.plan?.candidateSearch ?? false],
    features: [(this.data.plan?.features ?? []).join('\n')],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const features = raw.features
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    this.dialogRef.close({
      name: raw.name.trim(),
      price: Number(raw.price),
      maxJobs: Number(raw.maxJobs),
      maxRecruiters: Number(raw.maxRecruiters),
      candidateSearch: raw.candidateSearch,
      features,
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
