import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiError, Id } from '@core/models/common.model';
import { AdminCompanyDetail } from '@core/models/admin-company.model';
import { CompanyStatus, COMPANY_STATUS_META } from '@core/enums/company-status.enum';
import { COMPANY_SIZE_LABELS } from '@core/enums/company-size.enum';
import { VERIFICATION_STATUS_META } from '@core/enums/verification-status.enum';
import { formatDate } from '@core/utils/format';
import { AdminCompanyService } from '../../services/admin-company.service';
import { AdminCompanyActionsService } from '../../services/admin-company-actions.service';

/** Admin company detail — profile, counts, locations, admins, plan + suspend/activate (PA1.2 §8.2). */
@Component({
  selector: 'app-admin-company-detail',
  standalone: false,
  templateUrl: './admin-company-detail.component.html',
  styleUrl: './admin-company-detail.component.scss',
})
export class AdminCompanyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AdminCompanyService);
  private readonly actions = inject(AdminCompanyActionsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly company = signal<AdminCompanyDetail | null>(null);
  readonly busy = signal(false);

  readonly statusMeta = COMPANY_STATUS_META;
  readonly verificationMeta = VERIFICATION_STATUS_META;
  readonly sizeLabels = COMPANY_SIZE_LABELS;
  readonly formatDate = formatDate;

  readonly initial = computed(() => this.company()?.name.charAt(0).toUpperCase() ?? '?');
  readonly isSuspended = computed(() => this.company()?.status === CompanyStatus.Suspended);

  private id!: Id;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  toggleStatus(): void {
    const company = this.company();
    if (!company) {
      return;
    }
    this.busy.set(true);
    this.actions.toggleStatus(company).subscribe((updated) => {
      if (updated) {
        this.company.update((current) => (current ? { ...current, status: updated.status } : current));
      }
      this.busy.set(false);
    });
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getById(this.id).subscribe({
      next: (company) => {
        this.company.set(company);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load this company.');
        this.loading.set(false);
      },
    });
  }
}
