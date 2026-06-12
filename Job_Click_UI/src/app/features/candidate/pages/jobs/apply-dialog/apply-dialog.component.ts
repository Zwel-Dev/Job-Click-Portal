import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, forkJoin } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { Application } from '@core/models/application.model';
import { JobSummary } from '@core/models/job.model';
import { Resume } from '@core/models/candidate.model';
import { ScreeningAnswer, ScreeningQuestion } from '@core/models/screening.model';
import { ScreeningQuestionType } from '@core/enums/screening-question-type.enum';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';
import { ResumeService } from '../../../services/resume.service';
import { JobSearchService } from '../../../services/job-search.service';
import { ApplicationService } from '../../../services/application.service';

export interface ApplyDialogData {
  job: JobSummary;
}

interface ChecklistItem {
  label: string;
  met: boolean;
  actionLabel: string;
  actionLink: string;
}

@Component({
  selector: 'app-apply-dialog',
  standalone: false,
  templateUrl: './apply-dialog.component.html',
  styleUrl: './apply-dialog.component.scss',
})
export class ApplyDialogComponent implements OnInit {
  readonly data = inject<ApplyDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ApplyDialogComponent, Application | null>);
  private readonly fb = inject(FormBuilder);
  private readonly resumeService = inject(ResumeService);
  private readonly jobSearchService = inject(JobSearchService);
  private readonly applicationService = inject(ApplicationService);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly profileStore = inject(CandidateProfileStore);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly resumes = signal<Resume[]>([]);
  readonly questions = signal<ScreeningQuestion[]>([]);

  readonly QType = ScreeningQuestionType;

  readonly form = this.fb.nonNullable.group({
    resumeId: [0, [Validators.required, Validators.min(1)]],
    coverNote: [''],
  });

  /** One control per screening question, in question order. */
  readonly answers = this.fb.array<FormControl<string>>([]);

  readonly checklist = computed<ChecklistItem[]>(() => {
    const user = this.currentUser.user();
    return [
      {
        label: 'Verify your email address',
        met: Boolean(user?.emailVerified),
        actionLabel: 'Verify email',
        actionLink: '/auth/verify-email',
      },
      {
        label: 'Add at least one resume',
        met: this.resumes().length > 0,
        actionLabel: 'Add resume',
        actionLink: '/candidate/resumes',
      },
      {
        label: 'Complete your profile (60%+)',
        met: this.profileStore.completion() >= 60,
        actionLabel: 'Update profile',
        actionLink: '/candidate/profile',
      },
    ];
  });
  readonly ready = computed(() => this.checklist().every((item) => item.met));

  ngOnInit(): void {
    this.profileStore.load();
    forkJoin({
      resumes: this.resumeService.list(),
      job: this.jobSearchService.getById(this.data.job.id),
    }).subscribe({
      next: ({ resumes, job }) => {
        this.resumes.set(resumes);
        const preferred = resumes.find((resume) => resume.isDefault) ?? resumes[0];
        if (preferred) {
          this.form.patchValue({ resumeId: preferred.id });
        }
        this.buildAnswers(job.screeningQuestions ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  answerControl(index: number): FormControl<string> {
    return this.answers.at(index);
  }

  submit(): void {
    if (!this.ready() || this.form.invalid || this.answers.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    const { resumeId, coverNote } = this.form.getRawValue();
    this.applicationService
      .apply({
        jobId: this.data.job.id,
        resumeId,
        coverNote: coverNote || undefined,
        answers: this.collectAnswers(),
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (application) => {
          this.toast.success('Application submitted.');
          this.dialogRef.close(application);
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  private buildAnswers(questions: ScreeningQuestion[]): void {
    this.questions.set(questions);
    this.answers.clear();
    for (const question of questions) {
      this.answers.push(
        this.fb.nonNullable.control('', question.required ? [Validators.required] : []),
      );
    }
  }

  private collectAnswers(): ScreeningAnswer[] | undefined {
    const questions = this.questions();
    if (!questions.length) {
      return undefined;
    }
    const answers: ScreeningAnswer[] = [];
    questions.forEach((question, index) => {
      const value = this.answers.at(index).value.trim();
      if (value) {
        answers.push({ questionId: question.id, prompt: question.prompt, type: question.type, answer: value });
      }
    });
    return answers.length ? answers : undefined;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
