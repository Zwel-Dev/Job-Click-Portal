import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError, Id } from '@core/models/common.model';
import { CandidateCertification } from '@core/models/candidate.model';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';

@Component({
  selector: 'app-certifications-section',
  standalone: false,
  templateUrl: './certifications-section.component.html',
})
export class CertificationsSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly store = inject(CandidateProfileStore);
  readonly items = this.store.certifications;

  readonly formOpen = signal(false);
  readonly editingId = signal<Id | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    certificationName: ['', [Validators.required]],
    issuer: ['', [Validators.required]],
    issueDate: [''],
    expiryDate: [''],
  });

  startAdd(): void {
    this.editingId.set(null);
    this.form.reset({ certificationName: '', issuer: '', issueDate: '', expiryDate: '' });
    this.formOpen.set(true);
  }

  startEdit(item: CandidateCertification): void {
    this.editingId.set(item.id);
    this.form.reset({
      certificationName: item.certificationName,
      issuer: item.issuer,
      issueDate: item.issueDate ?? '',
      expiryDate: item.expiryDate ?? '',
    });
    this.formOpen.set(true);
  }

  cancel(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const input: Omit<CandidateCertification, 'id'> = {
      certificationName: value.certificationName,
      issuer: value.issuer,
      issueDate: value.issueDate || undefined,
      expiryDate: value.expiryDate || undefined,
    };
    const id = this.editingId();
    const op = id ? this.store.updateCertification(id, input) : this.store.addCertification(input);

    this.saving.set(true);
    op.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.formOpen.set(false);
        this.toast.success(id ? 'Certification updated.' : 'Certification added.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  remove(item: CandidateCertification): void {
    this.confirm
      .confirm({
        title: 'Remove certification',
        message: `Remove "${item.certificationName}"?`,
        confirmLabel: 'Remove',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.store.removeCertification(item.id).subscribe({
          next: () => this.toast.success('Certification removed.'),
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }
}
