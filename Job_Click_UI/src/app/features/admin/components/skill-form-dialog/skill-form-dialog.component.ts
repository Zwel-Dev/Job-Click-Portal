import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Skill, SkillFormValue } from '../../models/platform-settings.model';

export interface SkillFormDialogData {
  skill?: Skill;
}

/** Add / edit a skill. Resolves to the form value, or null if cancelled. */
@Component({
  selector: 'app-skill-form-dialog',
  standalone: false,
  templateUrl: './skill-form-dialog.component.html',
  styleUrl: './skill-form-dialog.component.scss',
})
export class SkillFormDialogComponent {
  readonly data = inject<SkillFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SkillFormDialogComponent, SkillFormValue | null>);
  private readonly fb = inject(FormBuilder);

  readonly isEdit = !!this.data.skill;

  readonly form = this.fb.nonNullable.group({
    name: [this.data.skill?.name ?? '', [Validators.required, Validators.maxLength(60)]],
    category: [this.data.skill?.category ?? '', [Validators.required, Validators.maxLength(40)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.dialogRef.close({ name: raw.name.trim(), category: raw.category.trim() });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
