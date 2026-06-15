import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiError } from '@core/models/common.model';
import { SystemKpis } from '@core/models/admin-platform.model';
import { AdminDashboardService } from '../services/admin-dashboard.service';

/**
 * Platform-admin context — loads the system KPI snapshot once for the shell and
 * exposes the queue counts as nav badges (pending verifications, open fraud
 * signals). The dashboard reads the same `kpis` signal for its KPI strip, so the
 * shell and dashboard never disagree (§7).
 */
@Injectable({ providedIn: 'root' })
export class AdminContextStore {
  private readonly dashboardService = inject(AdminDashboardService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly kpis = signal<SystemKpis | null>(null);

  readonly pendingVerifications = computed(() => this.kpis()?.pendingVerifications ?? 0);
  readonly openFraudSignals = computed(() => this.kpis()?.openFraudSignals ?? 0);

  /** Loads the KPI snapshot once; pass `force` to refresh. */
  load(force = false): void {
    if (this.loading() || (this.kpis() && !force)) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.getKpis().subscribe({
      next: (kpis) => {
        this.kpis.set(kpis);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load platform metrics.');
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.load(true);
  }
}
