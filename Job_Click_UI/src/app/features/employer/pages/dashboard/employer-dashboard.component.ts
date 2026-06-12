import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { ApiError } from '@core/models/common.model';
import { APPLICATION_STATUS_META } from '@core/enums/application-status.enum';
import { ApplicantSummary } from '@core/models/applicant.model';
import { formatDate } from '@core/utils/format';
import { EmployerContextStore } from '../../state/employer-context.store';
import { EmployerDashboardService } from '../../services/employer-dashboard.service';
import { EmployerKpis, PipelineStageCount } from '../../models/employer-dashboard.model';

/** Recruiter dashboard — KPI strip + pipeline snapshot + recent applicants (R1.6). */
@Component({
  selector: 'app-employer-dashboard',
  standalone: false,
  templateUrl: './employer-dashboard.component.html',
  styleUrl: './employer-dashboard.component.scss',
})
export class EmployerDashboardComponent implements OnInit {
  readonly currentUser = inject(CurrentUserStore);
  readonly context = inject(EmployerContextStore);
  private readonly dashboardService = inject(EmployerDashboardService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly kpis = signal<EmployerKpis | null>(null);
  readonly pipeline = signal<PipelineStageCount[]>([]);
  readonly recentApplicants = signal<ApplicantSummary[]>([]);

  readonly statusMeta = APPLICATION_STATUS_META;
  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2, 3];

  readonly greeting = computed(() => {
    const name = this.currentUser.displayName();
    return name ? `Welcome back, ${name}` : 'Welcome back';
  });
  readonly subtitle = computed(() => {
    const company = this.context.companyName();
    const role = this.context.activeRoleLabel();
    return company ? `${role} at ${company}` : 'Employer workspace';
  });
  readonly pipelineMax = computed(() =>
    Math.max(1, ...this.pipeline().map((stage) => stage.count)),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.kpis.set(null);
    this.dashboardService.load(5).subscribe({
      next: (data) => {
        this.kpis.set(data.kpis);
        this.pipeline.set(data.pipeline);
        this.recentApplicants.set(data.recentApplicants);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load your dashboard.');
        this.loading.set(false);
      },
    });
  }

  barWidth(count: number): string {
    return `${Math.round((count / this.pipelineMax()) * 100)}%`;
  }
}
