import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { CompanyVerification, VerificationFormValue } from '@core/models/company.model';
import { VERIFICATION_STATUS_META, VerificationStatus } from '@core/enums/verification-status.enum';
import { formatDate } from '@core/utils/format';
import { CompanyVerificationService } from '../../services/company-verification.service';
import { CompanyContextStore } from '../../state/company-context.store';

interface DocLite {
  fileName: string;
  fileUrl: string;
}

interface TimelineStep {
  label: string;
  state: 'done' | 'current' | 'rejected' | 'upcoming';
}

const PLACEHOLDER_URL = 'assets/mock/files/sample-resume.pdf';

@Component({
  selector: 'app-verification-center',
  standalone: false,
  templateUrl: './verification-center.component.html',
  styleUrl: './verification-center.component.scss',
})
export class VerificationCenterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly verificationService = inject(CompanyVerificationService);
  private readonly companyContext = inject(CompanyContextStore);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly verification = signal<CompanyVerification | null>(null);
  readonly businessDoc = signal<DocLite | null>(null);
  readonly taxDoc = signal<DocLite | null>(null);

  readonly statusMeta = VERIFICATION_STATUS_META;
  readonly formatDate = formatDate;
  readonly VerificationStatus = VerificationStatus;

  readonly form = this.fb.nonNullable.group({
    registrationNo: ['', [Validators.required, Validators.maxLength(60)]],
    taxNo: ['', Validators.maxLength(60)],
    officialEmail: ['', [Validators.required, Validators.email]],
    website: ['', Validators.maxLength(200)],
  });

  readonly canEdit = computed(() => {
    const status = this.verification()?.status;
    return status === VerificationStatus.Unverified || status === VerificationStatus.Rejected;
  });

  readonly steps = computed<TimelineStep[]>(() => {
    const status = this.verification()?.status ?? VerificationStatus.Unverified;
    const submitted = status !== VerificationStatus.Unverified;
    const decided = status === VerificationStatus.Verified || status === VerificationStatus.Rejected;
    return [
      { label: 'Submitted', state: submitted ? 'done' : 'upcoming' },
      {
        label: 'Under review',
        state: status === VerificationStatus.Pending ? 'current' : decided ? 'done' : 'upcoming',
      },
      {
        label: status === VerificationStatus.Rejected ? 'Rejected' : 'Verified',
        state:
          status === VerificationStatus.Verified
            ? 'done'
            : status === VerificationStatus.Rejected
              ? 'rejected'
              : 'upcoming',
      },
    ];
  });

  get canSubmit(): boolean {
    return !this.submitting() && this.form.valid && this.businessDoc() !== null;
  }

  ngOnInit(): void {
    this.load();
  }

  reload(): void {
    this.load();
  }

  onBusinessDoc(file: File): void {
    this.businessDoc.set({ fileName: file.name, fileUrl: PLACEHOLDER_URL });
  }

  onTaxDoc(file: File): void {
    this.taxDoc.set({ fileName: file.name, fileUrl: PLACEHOLDER_URL });
  }

  submit(): void {
    if (!this.canSubmit) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const documents: VerificationFormValue['documents'] = [];
    const business = this.businessDoc();
    if (business) {
      documents.push({ label: 'Business registration', fileName: business.fileName, fileUrl: business.fileUrl });
    }
    const tax = this.taxDoc();
    if (tax) {
      documents.push({ label: 'Tax registration', fileName: tax.fileName, fileUrl: tax.fileUrl });
    }
    const value: VerificationFormValue = {
      registrationNo: raw.registrationNo.trim(),
      taxNo: raw.taxNo.trim() || undefined,
      website: raw.website.trim() || undefined,
      officialEmail: raw.officialEmail.trim(),
      documents,
    };

    const wasRejected = this.verification()?.status === VerificationStatus.Rejected;
    const request = wasRejected ? this.verificationService.resubmit(value) : this.verificationService.submit(value);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (verification) => {
        this.verification.set(verification);
        this.companyContext.reload();
        this.toast.success('Submitted for verification.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.verificationService.get().subscribe({
      next: (verification) => {
        this.verification.set(verification);
        this.prefill(verification);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load verification.');
        this.loading.set(false);
      },
    });
  }

  private prefill(verification: CompanyVerification): void {
    if (verification.status !== VerificationStatus.Rejected) {
      return;
    }
    this.form.patchValue({
      registrationNo: verification.registrationNo ?? '',
      taxNo: verification.taxNo ?? '',
      officialEmail: verification.officialEmail ?? '',
      website: verification.website ?? '',
    });
    const business = verification.documents.find((doc) => doc.label === 'Business registration');
    if (business) {
      this.businessDoc.set({ fileName: business.fileName, fileUrl: business.fileUrl });
    }
    const tax = verification.documents.find((doc) => doc.label === 'Tax registration');
    if (tax) {
      this.taxDoc.set({ fileName: tax.fileName, fileUrl: tax.fileUrl });
    }
  }
}
