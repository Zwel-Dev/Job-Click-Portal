import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompanyLocationFormValue } from '@core/models/company.model';

export interface LocationDialogData {
  mode: 'create' | 'edit';
  value?: CompanyLocationFormValue;
  /** True when this is the only/last head office — the toggle is locked on. */
  lockHeadOffice?: boolean;
}

@Component({
  selector: 'app-location-form-dialog',
  standalone: false,
  templateUrl: './location-form-dialog.component.html',
  styleUrl: './location-form-dialog.component.scss',
})
export class LocationFormDialogComponent {
  readonly data = inject<LocationDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<LocationFormDialogComponent, CompanyLocationFormValue | null>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    country: [this.data.value?.country ?? 'Myanmar', [Validators.required, Validators.maxLength(80)]],
    state: [this.data.value?.state ?? '', Validators.maxLength(80)],
    city: [this.data.value?.city ?? '', [Validators.required, Validators.maxLength(80)]],
    address: [this.data.value?.address ?? '', Validators.maxLength(160)],
    postalCode: [this.data.value?.postalCode ?? '', Validators.maxLength(20)],
    isHeadOffice: [{ value: this.data.value?.isHeadOffice ?? false, disabled: !!this.data.lockHeadOffice }],
  });

  get title(): string {
    return this.data.mode === 'edit' ? 'Edit location' : 'Add location';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value: CompanyLocationFormValue = {
      country: raw.country.trim(),
      state: raw.state.trim() || undefined,
      city: raw.city.trim(),
      address: raw.address.trim() || undefined,
      postalCode: raw.postalCode.trim() || undefined,
      isHeadOffice: this.data.lockHeadOffice ? true : raw.isHeadOffice,
    };
    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
