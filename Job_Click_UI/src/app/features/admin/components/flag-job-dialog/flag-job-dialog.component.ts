import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface FlagJobDialogData {
  jobTitle: string;
  currentReason?: string;
}

/** Captures a reason when flagging a job. Resolves to the reason, or null if cancelled. */
@Component({
  selector: 'app-flag-job-dialog',
  standalone: false,
  templateUrl: './flag-job-dialog.component.html',
  styleUrl: './flag-job-dialog.component.scss',
})
export class FlagJobDialogComponent {
  readonly data = inject<FlagJobDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FlagJobDialogComponent, string | null>);

  readonly reasonControl = new FormControl(this.data.currentReason ?? '', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(300)],
  });

  submit(): void {
    if (this.reasonControl.invalid) {
      this.reasonControl.markAsTouched();
      return;
    }
    this.dialogRef.close(this.reasonControl.value.trim());
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
