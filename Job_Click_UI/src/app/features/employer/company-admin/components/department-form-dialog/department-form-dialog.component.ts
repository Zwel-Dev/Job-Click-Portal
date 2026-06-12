import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DepartmentFormValue } from '@core/models/company.model';

export interface DepartmentDialogData {
  mode: 'create' | 'edit';
  value?: DepartmentFormValue;
}

@Component({
  selector: 'app-department-form-dialog',
  standalone: false,
  templateUrl: './department-form-dialog.component.html',
  styleUrl: './department-form-dialog.component.scss',
})
export class DepartmentFormDialogComponent {
  readonly data = inject<DepartmentDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DepartmentFormDialogComponent, DepartmentFormValue | null>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.value?.name ?? '', [Validators.required, Validators.maxLength(80)]],
    description: [this.data.value?.description ?? '', Validators.maxLength(200)],
  });

  get title(): string {
    return this.data.mode === 'edit' ? 'Edit department' : 'Add department';
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
