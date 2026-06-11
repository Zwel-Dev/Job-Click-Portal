import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';

@Component({
  selector: 'app-professional-summary-section',
  standalone: false,
  templateUrl: './professional-summary-section.component.html',
})
export class ProfessionalSummarySectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  readonly store = inject(CandidateProfileStore);

  readonly editing = signal(false);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    headline: ['', [Validators.maxLength(120)]],
    summary: ['', [Validators.maxLength(2000)]],
    careerObjective: ['', [Validators.maxLength(500)]],
  });

  startEdit(): void {
    const profile = this.store.profile();
    if (!profile) {
      return;
    }
    this.form.reset({
      headline: profile.headline ?? '',
      summary: profile.summary ?? '',
      careerObjective: profile.careerObjective ?? '',
    });
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.store
      .saveProfile(this.form.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.editing.set(false);
          this.toast.success('Professional summary updated.');
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }
}
