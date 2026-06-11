import { Component, WritableSignal, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { EMPLOYMENT_TYPE_LABELS, EmploymentType } from '@core/enums/employment-type.enum';
import { WORK_MODE_LABELS, WorkMode } from '@core/enums/work-mode.enum';
import { CURRENCIES } from '@core/constants/profile-options';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';

@Component({
  selector: 'app-employment-preferences-section',
  standalone: false,
  templateUrl: './employment-preferences-section.component.html',
})
export class EmploymentPreferencesSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  readonly store = inject(CandidateProfileStore);

  readonly employmentTypeOptions = Object.values(EmploymentType);
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly workModeOptions = Object.values(WorkMode);
  readonly workModeLabels = WORK_MODE_LABELS;
  readonly currencies = CURRENCIES;

  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly titles = signal<string[]>([]);
  readonly locations = signal<string[]>([]);

  readonly form = this.fb.group({
    employmentTypes: this.fb.control<EmploymentType[]>([], { nonNullable: true }),
    workMode: this.fb.control<WorkMode | null>(null),
    expectedSalary: this.fb.control<number | null>(null),
    currency: this.fb.control<string>('MMK', { nonNullable: true }),
  });

  startEdit(): void {
    const profile = this.store.profile();
    if (!profile) {
      return;
    }
    this.titles.set([...profile.preferredJobTitles]);
    this.locations.set([...profile.preferredLocations]);
    this.form.reset({
      employmentTypes: [...profile.employmentTypes],
      workMode: profile.workMode ?? null,
      expectedSalary: profile.expectedSalary ?? null,
      currency: profile.currency ?? 'MMK',
    });
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
  }

  addTitle(event: MatChipInputEvent): void {
    this.addChip(this.titles, event);
  }
  removeTitle(value: string): void {
    this.titles.update((list) => list.filter((t) => t !== value));
  }

  addLocation(event: MatChipInputEvent): void {
    this.addChip(this.locations, event);
  }
  removeLocation(value: string): void {
    this.locations.update((list) => list.filter((t) => t !== value));
  }

  formatTypes(types: EmploymentType[]): string {
    return types.map((type) => this.employmentTypeLabels[type]).join(', ');
  }

  save(): void {
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.store
      .saveProfile({
        preferredJobTitles: this.titles(),
        preferredLocations: this.locations(),
        employmentTypes: value.employmentTypes,
        workMode: value.workMode ?? undefined,
        expectedSalary: value.expectedSalary ?? undefined,
        currency: value.currency,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.editing.set(false);
          this.toast.success('Employment preferences updated.');
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  private addChip(target: WritableSignal<string[]>, event: MatChipInputEvent): void {
    const value = event.value.trim();
    if (value && !target().includes(value)) {
      target.update((list) => [...list, value]);
    }
    event.chipInput.clear();
  }
}
