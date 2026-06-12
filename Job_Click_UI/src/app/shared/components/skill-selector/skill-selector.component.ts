import { Component, computed, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { JobSkillRequirement } from '@core/models/job.model';
import { SKILL_TAXONOMY } from '@core/constants/skill-options';

/**
 * Multi-skill picker (typeahead over the skill taxonomy), each skill flagged
 * required/optional. A `ControlValueAccessor`, so it binds to a reactive form
 * control with value `JobSkillRequirement[]`.
 */
@Component({
  selector: 'app-skill-selector',
  standalone: false,
  templateUrl: './skill-selector.component.html',
  styleUrl: './skill-selector.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SkillSelectorComponent), multi: true },
  ],
})
export class SkillSelectorComponent implements ControlValueAccessor {
  readonly skills = signal<JobSkillRequirement[]>([]);
  readonly query = signal('');
  readonly disabled = signal(false);

  readonly filtered = computed(() => {
    const query = this.query().toLowerCase().trim();
    const selected = new Set(this.skills().map((skill) => skill.name.toLowerCase()));
    return SKILL_TAXONOMY.filter(
      (skill) => !selected.has(skill.toLowerCase()) && (!query || skill.toLowerCase().includes(query)),
    ).slice(0, 8);
  });

  private onChange: (value: JobSkillRequirement[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: JobSkillRequirement[] | null): void {
    this.skills.set(value ?? []);
  }
  registerOnChange(fn: (value: JobSkillRequirement[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onEnter(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    this.addSkill(input.value);
    input.value = '';
  }

  onSelected(event: MatAutocompleteSelectedEvent, input: HTMLInputElement): void {
    this.addSkill(event.option.value);
    input.value = '';
  }

  toggleRequired(target: JobSkillRequirement): void {
    this.skills.update((list) =>
      list.map((skill) => (skill.name === target.name ? { ...skill, required: !skill.required } : skill)),
    );
    this.emit();
  }

  remove(target: JobSkillRequirement): void {
    this.skills.update((list) => list.filter((skill) => skill.name !== target.name));
    this.emit();
  }

  private addSkill(name: string): void {
    const trimmed = name.trim();
    if (!trimmed || this.skills().some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())) {
      this.query.set('');
      return;
    }
    this.skills.update((list) => [...list, { skillId: 0, name: trimmed, required: true }]);
    this.query.set('');
    this.emit();
  }

  private emit(): void {
    this.onChange(this.skills());
    this.onTouched();
  }
}
