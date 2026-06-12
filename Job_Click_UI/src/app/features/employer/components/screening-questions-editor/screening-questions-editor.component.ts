import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Id } from '@core/models/common.model';
import {
  SCREENING_QUESTION_TYPE_LABELS,
  ScreeningQuestionType,
} from '@core/enums/screening-question-type.enum';
import {
  SCREENING_QUESTION_TEMPLATES,
  ScreeningQuestion,
  ScreeningQuestionTemplate,
} from '@core/models/screening.model';

interface ScreeningRow {
  id: Id;
  type: ScreeningQuestionType;
  prompt: string;
  required: boolean;
  optionsText: string;
}

/** Editor for a job's custom screening questions (used in the job wizard). */
@Component({
  selector: 'app-screening-questions-editor',
  standalone: false,
  templateUrl: './screening-questions-editor.component.html',
  styleUrl: './screening-questions-editor.component.scss',
})
export class ScreeningQuestionsEditorComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() initialQuestions: ScreeningQuestion[] = [];
  @Output() readonly questionsChange = new EventEmitter<ScreeningQuestion[]>();

  readonly form = this.fb.array<FormGroup>([]);
  readonly types = Object.values(ScreeningQuestionType);
  readonly typeLabels = SCREENING_QUESTION_TYPE_LABELS;
  readonly templates = SCREENING_QUESTION_TEMPLATES;
  readonly QType = ScreeningQuestionType;

  private nextId = 1;

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.emit());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialQuestions'] && this.initialQuestions.length && this.form.length === 0) {
      this.build(this.initialQuestions);
    }
  }

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  addCustom(): void {
    this.form.push(this.toGroup({ id: this.nextId++, type: ScreeningQuestionType.Text, prompt: '', required: false }));
  }

  addTemplate(template: ScreeningQuestionTemplate): void {
    this.form.push(this.toGroup({ id: this.nextId++, ...template }));
  }

  removeAt(index: number): void {
    this.form.removeAt(index);
  }

  private build(questions: ScreeningQuestion[]): void {
    this.form.clear({ emitEvent: false });
    for (const question of questions) {
      this.form.push(this.toGroup(question), { emitEvent: false });
    }
    this.nextId = questions.reduce((max, q) => Math.max(max, Number(q.id)), 0) + 1;
    this.emit();
  }

  private toGroup(question: ScreeningQuestion): FormGroup {
    return this.fb.nonNullable.group({
      id: [question.id],
      type: [question.type, Validators.required],
      prompt: [question.prompt, [Validators.required, Validators.maxLength(160)]],
      required: [question.required],
      optionsText: [(question.options ?? []).join(', ')],
    });
  }

  private emit(): void {
    const questions: ScreeningQuestion[] = this.form.controls.map((group) => {
      const row = group.value as ScreeningRow;
      const isChoice = row.type === ScreeningQuestionType.SingleChoice;
      return {
        id: row.id,
        type: row.type,
        prompt: row.prompt.trim(),
        required: row.required,
        options: isChoice ? parseOptions(row.optionsText) : undefined,
      };
    });
    this.questionsChange.emit(questions);
  }
}

function parseOptions(text: string): string[] {
  return text
    .split(',')
    .map((option) => option.trim())
    .filter((option) => option.length > 0);
}
