import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiError } from '@core/models/common.model';
import { EmployerAnalyticsService } from '../../../services/employer-analytics.service';
import { RecruitmentAnalytics } from '../../../models/employer-analytics.model';

/** Company-wide hiring insight (admin/manager) — reuses the recruiter analytics view (CA2.0). */
@Component({
  selector: 'app-company-insights',
  standalone: false,
  templateUrl: './company-insights.component.html',
  styleUrl: './company-insights.component.scss',
})
export class CompanyInsightsComponent implements OnInit {
  private readonly analyticsService = inject(EmployerAnalyticsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly analytics = signal<RecruitmentAnalytics | null>(null);

  readonly skeletons = [0, 1, 2, 3, 4];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.analytics.set(null);
    this.analyticsService.load().subscribe({
      next: (analytics) => {
        this.analytics.set(analytics);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load insights.');
        this.loading.set(false);
      },
    });
  }
}
