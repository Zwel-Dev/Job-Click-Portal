import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError, Id } from '@core/models/common.model';
import { CandidateEducation } from '@core/models/candidate.model';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';

@Component({
  selector: 'app-education-section',
  standalone: false,
  templateUrl: './education-section.component.html',
})
export class EducationSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly store = inject(CandidateProfileStore);
  readonly items = this.store.educations;

  readonly formOpen = signal(false);
  readonly editingId = signal<Id | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    institution: this.fb.nonNullable.control('', [Validators.required]),
    degree: this.fb.nonNullable.control('', [Validators.required]),
    major: this.fb.nonNullable.control('', [Validators.required]),
    gpa: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(5)]),
    graduationYear: this.fb.nonNullable.control<number | null>(null, [Validators.required]),
  });

  startAdd(): void {
    this.editingId.set(null);
    this.form.reset({ institution: '', degree: '', major: '', gpa: null, graduationYear: null });
    this.formOpen.set(true);
  }

  startEdit(item: CandidateEducation): void {
    this.editingId.set(item.id);
    this.form.reset({
      institution: item.institution,
      degree: item.degree,
      major: item.major,
      gpa: item.gpa ?? null,
      graduationYear: item.graduationYear,
    });
    this.formOpen.set(true);
  }

  cancel(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const input: Omit<CandidateEducation, 'id'> = {
      institution: value.institution,
      degree: value.degree,
      major: value.major,
      gpa: value.gpa ?? undefined,
      graduationYear: value.graduationYear ?? 0,
    };
    const id = this.editingId();
    const op = id ? this.store.updateEducation(id, input) : this.store.addEducation(input);

    this.saving.set(true);
    op.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.formOpen.set(false);
        this.toast.success(id ? 'Education updated.' : 'Education added.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  remove(item: CandidateEducation): void {
    this.confirm
      .confirm({
        title: 'Remove education',
        message: `Remove "${item.degree}" at ${item.institution}?`,
        confirmLabel: 'Remove',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.store.removeEducation(item.id).subscribe({
          next: () => this.toast.success('Education removed.'),
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }
}
