import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ASSESSMENT_STATUS_LABELS, AssessmentStatus } from '@core/enums/assessment-status.enum';
import { AssessmentFormValue } from '@core/models/assessment.model';

export interface AssessmentDialogData {
  mode: 'create' | 'edit';
  candidateName: string;
  value?: AssessmentFormValue;
}

@Component({
  selector: 'app-assessment-form',
  standalone: false,
  templateUrl: './assessment-form.component.html',
  styleUrl: './assessment-form.component.scss',
})
export class AssessmentFormComponent {
  readonly data = inject<AssessmentDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AssessmentFormComponent, AssessmentFormValue | null>);
  private readonly fb = inject(FormBuilder);

  readonly statusOptions = Object.values(AssessmentStatus).map((value) => ({
    value,
    label: ASSESSMENT_STATUS_LABELS[value],
  }));

  readonly form = this.fb.nonNullable.group({
    name: [this.data.value?.name ?? '', [Validators.required, Validators.maxLength(80)]],
    status: [this.data.value?.status ?? AssessmentStatus.Pending, Validators.required],
    score: [this.data.value?.score ?? null as number | null, [Validators.min(0), Validators.max(100)]],
    remarks: [this.data.value?.remarks ?? '', Validators.maxLength(240)],
  });

  get title(): string {
    return this.data.mode === 'edit' ? 'Edit assessment' : 'Add assessment';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value: AssessmentFormValue = {
      name: raw.name.trim(),
      status: raw.status,
      score: raw.score === null ? undefined : raw.score,
      remarks: raw.remarks.trim() || undefined,
    };
    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
