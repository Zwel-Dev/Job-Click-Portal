import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import {
  APPLICATION_STATUS_META,
  ApplicationStatus,
  PIPELINE_BOARD_STAGES,
} from '@core/enums/application-status.enum';
import { PROFICIENCY_LEVEL_LABELS } from '@core/enums/proficiency-level.enum';
import { ASSESSMENT_STATUS_META } from '@core/enums/assessment-status.enum';
import { CandidateExperience } from '@core/models/candidate.model';
import { ApplicantDetail } from '@core/models/applicant.model';
import { OfferFormValue } from '@core/models/offer.model';
import { Assessment, AssessmentFormValue } from '@core/models/assessment.model';
import { formatDate } from '@core/utils/format';
import { ApplicantService } from '../../services/applicant.service';
import { OfferService } from '../../services/offer.service';
import { AssessmentService } from '../../services/assessment.service';
import { OfferDialogData, OfferFormComponent } from '../offers/offer-form.component';
import { AssessmentDialogData, AssessmentFormComponent } from './assessment-form.component';

@Component({
  selector: 'app-applicant-detail',
  standalone: false,
  templateUrl: './applicant-detail.component.html',
  styleUrl: './applicant-detail.component.scss',
})
export class ApplicantDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly applicantService = inject(ApplicantService);
  private readonly offerService = inject(OfferService);
  private readonly assessmentService = inject(AssessmentService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly applicant = signal<ApplicantDetail | null>(null);
  readonly savingNote = signal(false);
  readonly assessments = signal<Assessment[]>([]);

  readonly noteControl = new FormControl('', { nonNullable: true });

  readonly statusMeta = APPLICATION_STATUS_META;
  readonly proficiencyLabels = PROFICIENCY_LEVEL_LABELS;
  readonly assessmentStatusMeta = ASSESSMENT_STATUS_META;
  readonly formatDate = formatDate;
  readonly boardStages = PIPELINE_BOARD_STAGES;
  readonly resumeUrl = 'assets/mock/files/sample-resume.pdf';

  private currentId = 0;

  readonly notesDesc = computed(() => {
    const applicant = this.applicant();
    return applicant ? [...applicant.notes].reverse() : [];
  });
  readonly historyDesc = computed(() => {
    const applicant = this.applicant();
    return applicant ? [...applicant.statusHistory].reverse() : [];
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.currentId = Number(params.get('id'));
      this.load();
    });
  }

  reload(): void {
    this.load();
  }

  roleDates(exp: CandidateExperience): string {
    const start = formatDate(exp.startDate);
    const end = exp.currentJob ? 'Present' : exp.endDate ? formatDate(exp.endDate) : '';
    return end ? `${start} – ${end}` : start;
  }

  moveStage(status: ApplicationStatus): void {
    const current = this.applicant();
    if (!current || current.status === status) {
      return;
    }
    this.applicantService.moveStage(current.applicationId, status).subscribe({
      next: () => {
        this.applicant.set({
          ...current,
          status,
          statusHistory: [...current.statusHistory, { status, changedAt: new Date().toISOString() }],
        });
        this.toast.success(`Moved to ${this.statusMeta[status].label}.`);
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  createOffer(): void {
    const current = this.applicant();
    if (!current) {
      return;
    }
    const data: OfferDialogData = {
      candidateName: current.fullName,
      jobTitle: current.jobTitle,
      defaultCurrency: 'MMK',
    };
    this.dialog
      .open(OfferFormComponent, { data, width: '460px' })
      .afterClosed()
      .subscribe((value: OfferFormValue | null | undefined) => {
        if (!value) {
          return;
        }
        this.offerService
          .create({ applicationId: current.applicationId, candidateName: current.fullName, jobTitle: current.jobTitle }, value)
          .subscribe({
            next: () => {
              this.applicant.set({
                ...current,
                status: ApplicationStatus.Offer,
                statusHistory: [
                  ...current.statusHistory,
                  { status: ApplicationStatus.Offer, changedAt: new Date().toISOString() },
                ],
              });
              this.toast.success('Offer created and candidate moved to Offer.');
            },
            error: (error: ApiError) => this.toast.error(error.message),
          });
      });
  }

  addAssessment(): void {
    const current = this.applicant();
    if (!current) {
      return;
    }
    const data: AssessmentDialogData = { mode: 'create', candidateName: current.fullName };
    this.dialog
      .open(AssessmentFormComponent, { data, width: '460px' })
      .afterClosed()
      .subscribe((value: AssessmentFormValue | null | undefined) => {
        if (!value) {
          return;
        }
        this.assessmentService.add(current.applicationId, value).subscribe({
          next: () => {
            this.toast.success('Assessment added.');
            this.loadAssessments(current.applicationId);
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  editAssessment(assessment: Assessment): void {
    const current = this.applicant();
    if (!current) {
      return;
    }
    const data: AssessmentDialogData = {
      mode: 'edit',
      candidateName: current.fullName,
      value: {
        name: assessment.name,
        status: assessment.status,
        score: assessment.score,
        remarks: assessment.remarks,
      },
    };
    this.dialog
      .open(AssessmentFormComponent, { data, width: '460px' })
      .afterClosed()
      .subscribe((value: AssessmentFormValue | null | undefined) => {
        if (!value) {
          return;
        }
        this.assessmentService.update(assessment.id, value).subscribe({
          next: () => {
            this.toast.success('Assessment updated.');
            this.loadAssessments(current.applicationId);
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  removeAssessment(assessment: Assessment): void {
    const current = this.applicant();
    if (!current) {
      return;
    }
    this.assessmentService.remove(assessment.id).subscribe({
      next: () => {
        this.toast.success('Assessment removed.');
        this.loadAssessments(current.applicationId);
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private loadAssessments(applicationId: number): void {
    this.assessmentService.listByApplication(applicationId).subscribe({
      next: (assessments) => this.assessments.set(assessments),
      error: () => this.assessments.set([]),
    });
  }

  addNote(): void {
    const current = this.applicant();
    const body = this.noteControl.value.trim();
    if (!current || !body) {
      return;
    }
    this.savingNote.set(true);
    this.applicantService.addNote(current.applicationId, body).subscribe({
      next: (note) => {
        this.applicant.set({ ...current, notes: [...current.notes, note] });
        this.noteControl.reset('');
        this.savingNote.set(false);
        this.toast.success('Note added.');
      },
      error: (error: ApiError) => {
        this.savingNote.set(false);
        this.toast.error(error.message);
      },
    });
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    event.chipInput?.clear();
    const current = this.applicant();
    if (!current || !value || current.tags.includes(value)) {
      return;
    }
    this.persistTags(current, [...current.tags, value]);
  }

  removeTag(tag: string): void {
    const current = this.applicant();
    if (!current) {
      return;
    }
    this.persistTags(current, current.tags.filter((item) => item !== tag));
  }

  private persistTags(current: ApplicantDetail, tags: string[]): void {
    this.applicant.set({ ...current, tags });
    this.applicantService.setTags(current.applicationId, tags).subscribe({
      error: (error: ApiError) => {
        this.applicant.set(current);
        this.toast.error(error.message);
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.applicant.set(null);
    this.assessments.set([]);
    this.applicantService.getApplicant(this.currentId).subscribe({
      next: (applicant) => {
        this.applicant.set(applicant);
        this.loading.set(false);
        this.loadAssessments(applicant.applicationId);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'This applicant could not be found.');
        this.loading.set(false);
      },
    });
  }
}
