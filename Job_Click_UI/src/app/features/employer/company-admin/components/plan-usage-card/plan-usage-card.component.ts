import { Component, computed, input } from '@angular/core';
import { PlanUsage } from '@core/models/subscription.model';

interface UsageRow {
  label: string;
  used: number;
  limit: number;
  pct: number;
  near: boolean;
  full: boolean;
}

/** Usage-vs-limit bars for the current plan (jobs, recruiters). */
@Component({
  selector: 'app-plan-usage-card',
  standalone: false,
  templateUrl: './plan-usage-card.component.html',
  styleUrl: './plan-usage-card.component.scss',
})
export class PlanUsageCardComponent {
  readonly usage = input.required<PlanUsage>();

  readonly rows = computed<UsageRow[]>(() => {
    const usage = this.usage();
    return [
      toRow('Active jobs', usage.jobsUsed, usage.jobsLimit),
      toRow('Recruiters', usage.recruitersUsed, usage.recruitersLimit),
    ];
  });

  barWidth(row: UsageRow): string {
    return `${Math.min(100, row.pct)}%`;
  }
}

function toRow(label: string, used: number, limit: number): UsageRow {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  return { label, used, limit, pct, near: pct >= 80 && pct < 100, full: pct >= 100 };
}
