import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiError } from '@core/models/common.model';
import { VerificationStatus } from '@core/enums/verification-status.enum';
import { CompanyService } from '../services/company.service';
import { CompanyOverview } from '../models/company-overview.model';

/**
 * Company-admin context — company profile, plan, and usage, loaded once for the
 * area. Exposes plan-limit signals consumed by the recruiter `planLimitGuard`
 * and "Create job"/"Invite" CTAs. Role/permission helpers stay in
 * `EmployerContextStore`.
 */
@Injectable({ providedIn: 'root' })
export class CompanyContextStore {
  private readonly companyService = inject(CompanyService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly overview = signal<CompanyOverview | null>(null);

  readonly company = computed(() => this.overview()?.company ?? null);
  readonly verification = computed(() => this.overview()?.verification ?? null);
  readonly plan = computed(() => this.overview()?.plan ?? null);
  readonly usage = computed(() => this.overview()?.usage ?? null);
  readonly counts = computed(() => this.overview()?.counts ?? null);

  readonly isVerified = computed(() => this.verification()?.status === VerificationStatus.Verified);

  readonly jobsRemaining = computed(() => {
    const usage = this.usage();
    return usage ? Math.max(0, usage.jobsLimit - usage.jobsUsed) : 0;
  });
  readonly recruitersRemaining = computed(() => {
    const usage = this.usage();
    return usage ? Math.max(0, usage.recruitersLimit - usage.recruitersUsed) : 0;
  });
  readonly atJobLimit = computed(() => !!this.usage() && this.jobsRemaining() === 0);
  readonly atRecruiterLimit = computed(() => !!this.usage() && this.recruitersRemaining() === 0);

  /** Loads the overview once; pass `force` to refresh. */
  load(force = false): void {
    if (this.loading() || (this.overview() && !force)) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.companyService.getOverview().subscribe({
      next: (overview) => {
        this.overview.set(overview);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load company.');
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.load(true);
  }
}
