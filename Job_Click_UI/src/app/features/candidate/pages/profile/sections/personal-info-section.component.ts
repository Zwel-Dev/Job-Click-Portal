import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { PHONE_PATTERN } from '@core/constants/patterns';
import { GENDERS } from '@core/constants/profile-options';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';

@Component({
  selector: 'app-personal-info-section',
  standalone: false,
  templateUrl: './personal-info-section.component.html',
})
export class PersonalInfoSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  readonly store = inject(CandidateProfileStore);
  readonly genders = GENDERS;

  readonly editing = signal(false);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    dateOfBirth: [''],
    gender: [''],
    nationality: [''],
    address: [''],
  });

  startEdit(): void {
    const profile = this.store.profile();
    if (!profile) {
      return;
    }
    this.form.reset({
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      dateOfBirth: profile.dateOfBirth ?? '',
      gender: profile.gender ?? '',
      nationality: profile.nationality ?? '',
      address: profile.address ?? '',
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
          this.toast.success('Personal information updated.');
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }
}
