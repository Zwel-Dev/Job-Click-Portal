import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError, Id } from '@core/models/common.model';
import { CandidateExperience } from '@core/models/candidate.model';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';

@Component({
  selector: 'app-work-experience-section',
  standalone: false,
  templateUrl: './work-experience-section.component.html',
})
export class WorkExperienceSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly store = inject(CandidateProfileStore);
  readonly items = this.store.experiences;

  readonly formOpen = signal(false);
  readonly editingId = signal<Id | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required]],
    jobTitle: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: [''],
    currentJob: [false],
    responsibilities: [''],
    achievements: [''],
  });

  constructor() {
    this.form.controls.currentJob.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((current) => {
        const endDate = this.form.controls.endDate;
        if (current) {
          endDate.reset('');
          endDate.disable();
        } else {
          endDate.enable();
        }
      });
  }

  startAdd(): void {
    this.editingId.set(null);
    this.resetForm();
    this.formOpen.set(true);
  }

  startEdit(item: CandidateExperience): void {
    this.editingId.set(item.id);
    this.form.reset({
      companyName: item.companyName,
      jobTitle: item.jobTitle,
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      currentJob: item.currentJob,
      responsibilities: item.responsibilities ?? '',
      achievements: item.achievements ?? '',
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
    const input: Omit<CandidateExperience, 'id'> = {
      companyName: value.companyName,
      jobTitle: value.jobTitle,
      startDate: value.startDate,
      endDate: value.currentJob ? undefined : value.endDate || undefined,
      currentJob: value.currentJob,
      responsibilities: value.responsibilities || undefined,
      achievements: value.achievements || undefined,
    };
    const id = this.editingId();
    const op = id ? this.store.updateExperience(id, input) : this.store.addExperience(input);

    this.saving.set(true);
    op.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.formOpen.set(false);
        this.toast.success(id ? 'Experience updated.' : 'Experience added.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  remove(item: CandidateExperience): void {
    this.confirm
      .confirm({
        title: 'Remove experience',
        message: `Remove "${item.jobTitle}" at ${item.companyName}?`,
        confirmLabel: 'Remove',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.store.removeExperience(item.id).subscribe({
          next: () => this.toast.success('Experience removed.'),
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  private resetForm(): void {
    this.form.reset({
      companyName: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      currentJob: false,
      responsibilities: '',
      achievements: '',
    });
    this.form.controls.endDate.enable();
  }
}
