import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError, Id } from '@core/models/common.model';
import { CandidateSkill } from '@core/models/candidate.model';
import { PROFICIENCY_LEVEL_LABELS, ProficiencyLevel } from '@core/enums/proficiency-level.enum';
import { SKILL_TAXONOMY } from '@core/constants/skill-options';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';

@Component({
  selector: 'app-skills-section',
  standalone: false,
  templateUrl: './skills-section.component.html',
})
export class SkillsSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly store = inject(CandidateProfileStore);
  readonly items = this.store.skills;

  readonly proficiencyOptions = Object.values(ProficiencyLevel);
  readonly proficiencyLabels = PROFICIENCY_LEVEL_LABELS;

  readonly formOpen = signal(false);
  readonly editingId = signal<Id | null>(null);
  readonly saving = signal(false);
  readonly skillQuery = signal('');

  readonly filteredSkills = computed(() => {
    const query = this.skillQuery().toLowerCase().trim();
    const list = query ? SKILL_TAXONOMY.filter((skill) => skill.toLowerCase().includes(query)) : SKILL_TAXONOMY;
    return list.slice(0, 8);
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    proficiency: [ProficiencyLevel.Intermediate, [Validators.required]],
    yearsExperience: [1, [Validators.required, Validators.min(0)]],
  });

  startAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', proficiency: ProficiencyLevel.Intermediate, yearsExperience: 1 });
    this.skillQuery.set('');
    this.formOpen.set(true);
  }

  startEdit(item: CandidateSkill): void {
    this.editingId.set(item.id);
    this.form.reset({ name: item.name, proficiency: item.proficiency, yearsExperience: item.yearsExperience });
    this.skillQuery.set(item.name);
    this.formOpen.set(true);
  }

  cancel(): void {
    this.formOpen.set(false);
  }

  onSkillInput(event: Event): void {
    this.skillQuery.set((event.target as HTMLInputElement).value);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const id = this.editingId();
    const existing = id ? this.items().find((skill) => skill.id === id) : undefined;
    const input: Omit<CandidateSkill, 'id'> = {
      skillId: existing?.skillId ?? 0,
      name: value.name,
      category: existing?.category,
      proficiency: value.proficiency,
      yearsExperience: value.yearsExperience,
    };
    const op = id ? this.store.updateSkill(id, input) : this.store.addSkill(input);

    this.saving.set(true);
    op.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.formOpen.set(false);
        this.toast.success(id ? 'Skill updated.' : 'Skill added.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  remove(item: CandidateSkill): void {
    this.confirm
      .confirm({ title: 'Remove skill', message: `Remove "${item.name}"?`, confirmLabel: 'Remove', danger: true })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.store.removeSkill(item.id).subscribe({
          next: () => this.toast.success('Skill removed.'),
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }
}
