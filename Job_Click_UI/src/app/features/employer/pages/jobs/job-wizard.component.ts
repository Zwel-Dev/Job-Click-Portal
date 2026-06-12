import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatChipInputEvent } from '@angular/material/chips';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError, Id } from '@core/models/common.model';
import { EMPLOYMENT_TYPE_LABELS, EmploymentType } from '@core/enums/employment-type.enum';
import { WORK_MODE_LABELS, WorkMode } from '@core/enums/work-mode.enum';
import { SENIORITY_LEVEL_LABELS, SeniorityLevel } from '@core/enums/seniority-level.enum';
import { CURRENCIES } from '@core/constants/profile-options';
import { formatSalary } from '@core/utils/format';
import { JobSkillRequirement } from '@core/models/job.model';
import { ScreeningQuestion } from '@core/models/screening.model';
import { JobFormValue } from '../../models/job-form.model';
import { JobService } from '../../services/job.service';
import { CompanyService } from '../../company-admin/services/company.service';

@Component({
  selector: 'app-job-wizard',
  standalone: false,
  templateUrl: './job-wizard.component.html',
  styleUrl: './job-wizard.component.scss',
})
export class JobWizardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobService = inject(JobService);
  private readonly companyService = inject(CompanyService);
  private readonly toast = inject(ToastService);

  readonly jobId = signal<Id | null>(null);
  readonly isEdit = computed(() => this.jobId() !== null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly benefits = signal<string[]>([]);
  readonly screeningQuestions = signal<ScreeningQuestion[]>([]);

  /** Loaded from the company's departments (CA1.3); seeded with sensible defaults. */
  readonly departments = signal<string[]>([
    'Engineering',
    'Design',
    'Product',
    'Data & Analytics',
    'Quality Assurance',
  ]);
  readonly employmentTypeOptions = Object.values(EmploymentType);
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly workModeOptions = Object.values(WorkMode);
  readonly workModeLabels = WORK_MODE_LABELS;
  readonly seniorityOptions = Object.values(SeniorityLevel);
  readonly seniorityLabels = SENIORITY_LEVEL_LABELS;
  readonly currencies = CURRENCIES;

  readonly basicForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    department: [''],
    employmentType: [EmploymentType.FullTime, [Validators.required]],
    workMode: [WorkMode.Onsite, [Validators.required]],
    seniorityLevel: [SeniorityLevel.Mid, [Validators.required]],
    location: ['', [Validators.required]],
  });

  readonly requirementsForm = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(20)]],
    requirements: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly compensationForm = this.fb.group({
    salaryMin: this.fb.control<number | null>(null),
    salaryMax: this.fb.control<number | null>(null),
    currency: this.fb.nonNullable.control('MMK'),
  });

  readonly skillsForm = this.fb.nonNullable.group({
    skills: this.fb.nonNullable.control<JobSkillRequirement[]>([]),
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.jobId.set(Number(id));
        this.loadForEdit(Number(id));
      }
    });
    this.companyService.listDepartments().subscribe({
      next: (departments) => {
        if (departments.length) {
          this.departments.set(departments.map((department) => department.name));
        }
      },
      error: () => undefined,
    });
  }

  addBenefit(event: MatChipInputEvent): void {
    const value = event.value.trim();
    if (value && !this.benefits().includes(value)) {
      this.benefits.update((list) => [...list, value]);
    }
    event.chipInput.clear();
  }

  removeBenefit(value: string): void {
    this.benefits.update((list) => list.filter((benefit) => benefit !== value));
  }

  saveDraft(): void {
    this.save(false);
  }

  submit(): void {
    this.save(true);
  }

  cancel(): void {
    this.router.navigate(['/employer/jobs']);
  }

  reviewSalary(): string {
    const comp = this.compensationForm.getRawValue();
    return formatSalary({
      salaryMin: comp.salaryMin ?? undefined,
      salaryMax: comp.salaryMax ?? undefined,
      currency: comp.currency,
    });
  }

  private save(submit: boolean): void {
    if (this.basicForm.invalid || this.requirementsForm.invalid) {
      this.basicForm.markAllAsTouched();
      this.requirementsForm.markAllAsTouched();
      return;
    }
    const basic = this.basicForm.getRawValue();
    const reqs = this.requirementsForm.getRawValue();
    const comp = this.compensationForm.getRawValue();
    const value: JobFormValue = {
      title: basic.title,
      department: basic.department || undefined,
      employmentType: basic.employmentType,
      workMode: basic.workMode,
      seniorityLevel: basic.seniorityLevel,
      location: basic.location,
      description: reqs.description,
      requirements: reqs.requirements,
      skills: this.skillsForm.controls.skills.value,
      salaryMin: comp.salaryMin ?? undefined,
      salaryMax: comp.salaryMax ?? undefined,
      currency: comp.currency,
      benefits: this.benefits(),
      screeningQuestions: this.screeningQuestions(),
    };

    const id = this.jobId();
    const op = id !== null ? this.jobService.update(id, value, submit) : this.jobService.create(value, submit);

    this.saving.set(true);
    op.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.toast.success(submit ? 'Job submitted for approval.' : 'Job saved as draft.');
        this.router.navigate(['/employer/jobs']);
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private loadForEdit(id: Id): void {
    this.loading.set(true);
    this.jobService
      .getFormValue(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (value) => {
          this.basicForm.patchValue({
            title: value.title,
            department: value.department ?? '',
            employmentType: value.employmentType,
            workMode: value.workMode,
            seniorityLevel: value.seniorityLevel,
            location: value.location,
          });
          this.requirementsForm.patchValue({ description: value.description, requirements: value.requirements });
          this.compensationForm.patchValue({
            salaryMin: value.salaryMin ?? null,
            salaryMax: value.salaryMax ?? null,
            currency: value.currency,
          });
          this.skillsForm.patchValue({ skills: value.skills });
          this.benefits.set(value.benefits);
          this.screeningQuestions.set(value.screeningQuestions);
        },
        error: (error: ApiError) => this.toast.error(error.message ?? 'Failed to load the job.'),
      });
  }
}
