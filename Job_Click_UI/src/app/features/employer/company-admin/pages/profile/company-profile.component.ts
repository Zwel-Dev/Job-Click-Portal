import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { Company, CompanyProfileFormValue } from '@core/models/company.model';
import { CompanySize, COMPANY_SIZE_LABELS } from '@core/enums/company-size.enum';
import { INDUSTRIES } from '@core/constants/company-options';
import { formatDate } from '@core/utils/format';
import { CanComponentDeactivate } from '@core/guards/unsaved-changes.guard';
import { CompanyService } from '../../services/company.service';
import { CompanyContextStore } from '../../state/company-context.store';

@Component({
  selector: 'app-company-profile',
  standalone: false,
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.scss',
})
export class CompanyProfileComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly companyContext = inject(CompanyContextStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  readonly uploadingLogo = signal(false);
  readonly company = signal<Company | null>(null);
  readonly logoUrl = signal<string | null>(null);

  readonly industries = INDUSTRIES;
  readonly companySizeOptions = Object.values(CompanySize);
  readonly companySizeLabels = COMPANY_SIZE_LABELS;
  readonly formatDate = formatDate;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    website: ['', [Validators.maxLength(200)]],
    industry: [''],
    companySize: ['' as CompanySize | ''],
    description: ['', [Validators.maxLength(1000)]],
  });

  readonly initial = computed(() => this.company()?.name.charAt(0).toUpperCase() ?? '?');

  ngOnInit(): void {
    this.load();
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.form.pristine) {
      return true;
    }
    return this.confirm.confirm({
      title: 'Discard changes?',
      message: 'You have unsaved changes to the company profile. Leave without saving?',
      confirmLabel: 'Discard',
      danger: true,
    });
  }

  onLogoSelected(file: File): void {
    this.uploadingLogo.set(true);
    this.companyService
      .uploadLogo(file)
      .pipe(finalize(() => this.uploadingLogo.set(false)))
      .subscribe({
        next: ({ logoUrl }) => {
          this.logoUrl.set(logoUrl);
          this.companyContext.reload();
          this.toast.success('Logo updated.');
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value: CompanyProfileFormValue = {
      name: raw.name.trim(),
      website: raw.website.trim() || undefined,
      industry: raw.industry || undefined,
      companySize: raw.companySize || undefined,
      description: raw.description.trim() || undefined,
    };
    this.saving.set(true);
    this.companyService
      .updateProfile(value)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (company) => {
          this.company.set(company);
          this.form.markAsPristine();
          this.companyContext.reload();
          this.toast.success('Company profile saved.');
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.companyService.getProfile().subscribe({
      next: (company) => {
        this.company.set(company);
        this.logoUrl.set(company.logoUrl ?? null);
        this.form.reset({
          name: company.name,
          website: company.website ?? '',
          industry: company.industry ?? '',
          companySize: company.companySize ?? '',
          description: company.description ?? '',
        });
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load the company profile.');
        this.loading.set(false);
      },
    });
  }
}
