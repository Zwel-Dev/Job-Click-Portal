import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { InviteRequest } from '@core/models/team.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { roleLabel } from '@core/utils/role-label';

@Component({
  selector: 'app-invite-member-dialog',
  standalone: false,
  templateUrl: './invite-member-dialog.component.html',
  styleUrl: './invite-member-dialog.component.scss',
})
export class InviteMemberDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<InviteMemberDialogComponent, InviteRequest | null>);
  private readonly fb = inject(FormBuilder);

  readonly roleOptions = [
    RoleCode.RecruitmentManager,
    RoleCode.Recruiter,
    RoleCode.HiringManager,
  ];
  readonly roleLabel = roleLabel;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: [RoleCode.Recruiter, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.dialogRef.close({ email: raw.email.trim().toLowerCase(), role: raw.role });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
