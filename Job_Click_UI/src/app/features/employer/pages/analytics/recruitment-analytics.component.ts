import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiError } from '@core/models/common.model';
import { EmployerAnalyticsService } from '../../services/employer-analytics.service';
import { RecruitmentAnalytics } from '../../models/employer-analytics.model';

@Component({
  selector: 'app-recruitment-analytics',
  standalone: false,
  templateUrl: './recruitment-analytics.component.html',
  styleUrl: './recruitment-analytics.component.scss',
})
export class RecruitmentAnalyticsComponent implements OnInit {
  private readonly analyticsService = inject(EmployerAnalyticsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly analytics = signal<RecruitmentAnalytics | null>(null);

  readonly skeletons = [0, 1, 2, 3, 4];

  private readonly funnelTop = computed(() => this.analytics()?.funnel[0]?.count ?? 1);
  private readonly maxJobApplicants = computed(() =>
    Math.max(1, ...(this.analytics()?.applicationsByJob.map((job) => job.applicants) ?? [1])),
  );

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
        this.error.set(error.message ?? 'Failed to load analytics.');
        this.loading.set(false);
      },
    });
  }

  /** Funnel bar width relative to the top stage. */
  funnelWidth(count: number): string {
    return `${Math.round((count / this.funnelTop()) * 100)}%`;
  }

  /** Conversion of a stage as a percentage of the top (Applied) stage. */
  pctOfApplied(count: number): number {
    return Math.round((count / this.funnelTop()) * 100);
  }

  /** Applications-by-job bar width relative to the busiest job. */
  jobBarWidth(applicants: number): string {
    return `${Math.round((applicants / this.maxJobApplicants()) * 100)}%`;
  }
}
