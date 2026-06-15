import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiError } from '@core/models/common.model';
import { GrowthPoint, SystemAnalytics } from '@core/models/system-analytics.model';
import { SystemAnalyticsService } from '../../services/system-analytics.service';

interface TrendChart {
  title: string;
  icon: string;
  series: GrowthPoint[];
  max: number;
}

/** System analytics — platform growth, funnel, and plan health (PA2.2 §8.6). CSS bars, no chart lib. */
@Component({
  selector: 'app-system-analytics',
  standalone: false,
  templateUrl: './system-analytics.component.html',
  styleUrl: './system-analytics.component.scss',
})
export class SystemAnalyticsComponent implements OnInit {
  private readonly service = inject(SystemAnalyticsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly analytics = signal<SystemAnalytics | null>(null);

  readonly skeletons = [0, 1, 2, 3];

  readonly trendCharts = computed<TrendChart[]>(() => {
    const data = this.analytics();
    if (!data) {
      return [];
    }
    return [
      { title: 'New users', icon: 'person_add', series: data.userGrowth },
      { title: 'New companies', icon: 'domain_add', series: data.companyGrowth },
      { title: 'Jobs posted', icon: 'work_outline', series: data.jobsPosted },
      { title: 'Applications', icon: 'mail_outline', series: data.applications },
    ].map((chart) => ({ ...chart, max: Math.max(1, ...chart.series.map((point) => point.value)) }));
  });

  private readonly funnelTop = computed(() => this.analytics()?.funnel[0]?.value ?? 1);
  private readonly planTotal = computed(() =>
    Math.max(1, (this.analytics()?.planDistribution ?? []).reduce((total, slice) => total + slice.value, 0)),
  );

  ngOnInit(): void {
    this.load();
  }

  barHeight(value: number, max: number): string {
    return `${Math.max(2, Math.round((value / max) * 100))}%`;
  }

  funnelWidth(value: number): string {
    return `${Math.round((value / this.funnelTop()) * 100)}%`;
  }

  funnelPct(value: number): number {
    return Math.round((value / this.funnelTop()) * 100);
  }

  planWidth(value: number): string {
    return `${Math.round((value / this.planTotal()) * 100)}%`;
  }

  planPct(value: number): number {
    return Math.round((value / this.planTotal()) * 100);
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.analytics.set(null);
    this.service.load().subscribe({
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
}
