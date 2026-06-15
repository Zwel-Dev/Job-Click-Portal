import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InterviewInvite } from '@core/models/messaging.model';

export interface InterviewInviteDialogData {
  jobTitle?: string;
  participantName: string;
}

const MODES = ['Online', 'On-site', 'Phone'];

/** Recruiter form to compose an interview invitation. Resolves to the invite, or null. */
@Component({
  selector: 'app-interview-invite-dialog',
  standalone: false,
  templateUrl: './interview-invite-dialog.component.html',
  styleUrl: './interview-invite-dialog.component.scss',
})
export class InterviewInviteDialogComponent {
  readonly data = inject<InterviewInviteDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<InterviewInviteDialogComponent, InterviewInvite | null>);
  private readonly fb = inject(FormBuilder);

  readonly modes = MODES;

  readonly form = this.fb.nonNullable.group({
    jobTitle: [this.data.jobTitle ?? '', [Validators.required, Validators.maxLength(120)]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    mode: ['Online', Validators.required],
    location: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const proposedAt = new Date(`${raw.date}T${raw.time}`).toISOString();
    this.dialogRef.close({
      jobTitle: raw.jobTitle.trim(),
      proposedAt,
      mode: raw.mode,
      location: raw.location.trim() || undefined,
      status: 'pending',
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
