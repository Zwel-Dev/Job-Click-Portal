import { Component, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Id } from '@core/models/common.model';
import { TeamMember } from '@core/models/team.model';
import { roleLabel } from '@core/utils/role-label';

export interface TransferOwnershipData {
  member: TeamMember;
}

@Component({
  selector: 'app-transfer-ownership-dialog',
  standalone: false,
  templateUrl: './transfer-ownership-dialog.component.html',
  styleUrl: './transfer-ownership-dialog.component.scss',
})
export class TransferOwnershipDialogComponent {
  readonly data = inject<TransferOwnershipData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TransferOwnershipDialogComponent, Id | null>);

  readonly confirmText = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  readonly confirmed = signal(false);

  readonly roleLabel = roleLabel;
  readonly keyword = 'TRANSFER';

  confirm(): void {
    if (this.confirmText.value.trim().toUpperCase() !== this.keyword) {
      this.confirmText.markAsTouched();
      this.confirmed.set(true);
      return;
    }
    this.dialogRef.close(this.data.member.userId);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
