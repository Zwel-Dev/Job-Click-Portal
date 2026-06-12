import { Component, computed, input } from '@angular/core';
import { RecruitmentAnalytics } from '../../models/employer-analytics.model';

/**
 * Presentational analytics dashboard (KPI strip + hiring funnel + applications
 * by job + recruiter performance). Lightweight CSS visuals — no chart lib.
 * Shared by the recruiter analytics page (R2.4) and company insights (CA2.0).
 */
@Component({
  selector: 'app-analytics-view',
  standalone: false,
  templateUrl: './analytics-view.component.html',
  styleUrl: './analytics-view.component.scss',
})
export class AnalyticsViewComponent {
  readonly data = input.required<RecruitmentAnalytics>();

  private readonly funnelTop = computed(() => this.data().funnel[0]?.count ?? 1);
  private readonly maxJobApplicants = computed(() =>
    Math.max(1, ...this.data().applicationsByJob.map((job) => job.applicants)),
  );

  funnelWidth(count: number): string {
    return `${Math.round((count / this.funnelTop()) * 100)}%`;
  }

  pctOfApplied(count: number): number {
    return Math.round((count / this.funnelTop()) * 100);
  }

  jobBarWidth(applicants: number): string {
    return `${Math.round((applicants / this.maxJobApplicants()) * 100)}%`;
  }
}
