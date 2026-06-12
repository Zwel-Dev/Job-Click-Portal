import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OfferFormValue } from '@core/models/offer.model';

export interface OfferDialogData {
  candidateName: string;
  jobTitle: string;
  defaultCurrency: string;
}

@Component({
  selector: 'app-offer-form',
  standalone: false,
  templateUrl: './offer-form.component.html',
  styleUrl: './offer-form.component.scss',
})
export class OfferFormComponent {
  readonly data = inject<OfferDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OfferFormComponent, OfferFormValue | null>);
  private readonly fb = inject(FormBuilder);

  readonly currencies = ['MMK', 'USD', 'SGD'];

  readonly form = this.fb.nonNullable.group({
    offeredSalary: [0, [Validators.required, Validators.min(1)]],
    currency: [this.data.defaultCurrency || 'MMK', Validators.required],
    joiningDate: [''],
    notes: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value: OfferFormValue = {
      offeredSalary: raw.offeredSalary,
      currency: raw.currency,
      joiningDate: raw.joiningDate || undefined,
      notes: raw.notes || undefined,
    };
    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
