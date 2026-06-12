import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TalentPoolFormValue } from '../../models/talent-pool.model';

export interface TalentPoolDialogData {
  mode: 'create' | 'edit';
  value?: TalentPoolFormValue;
}

@Component({
  selector: 'app-talent-pool-form',
  standalone: false,
  templateUrl: './talent-pool-form.component.html',
  styleUrl: './talent-pool-form.component.scss',
})
export class TalentPoolFormComponent {
  readonly data = inject<TalentPoolDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TalentPoolFormComponent, TalentPoolFormValue | null>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.value?.name ?? '', [Validators.required, Validators.maxLength(60)]],
    description: [this.data.value?.description ?? '', Validators.maxLength(160)],
  });

  get title(): string {
    return this.data.mode === 'edit' ? 'Edit pool' : 'New talent pool';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.dialogRef.close({ name: raw.name.trim(), description: raw.description.trim() || undefined });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
