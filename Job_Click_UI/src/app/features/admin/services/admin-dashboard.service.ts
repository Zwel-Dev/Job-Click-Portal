import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { SystemKpis } from '@core/models/admin-platform.model';
import { VerificationStore } from '@core/state/verification.store';
import { AdminDashboardWidgets } from '../models/admin-dashboard.model';
import { AdminUserService } from './admin-user.service';
import { FraudService } from './fraud.service';
import { buildSystemKpis } from './mock/mock-admin-data';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/admin/dashboard';

/**
 * Admin dashboard data source. Serves the platform KPI snapshot (consumed by the
 * shell `AdminContextStore` for nav badges) and the three queue widgets. Mock
 * branch gated on `environment.useMock`; real branch via `ApiBaseService`.
 */
@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly api = inject(ApiBaseService);
  private readonly userService = inject(AdminUserService);
  private readonly verificationStore = inject(VerificationStore);
  private readonly fraudService = inject(FraudService);

  /** Platform-wide headline metrics + queue counts. */
  getKpis(): Observable<SystemKpis> {
    if (!environment.useMock) {
      return this.api.get<SystemKpis>(`${ENDPOINT}/kpis`);
    }
    const kpis = buildSystemKpis(
      this.verificationStore.pendingQueue().length,
      this.fraudService.openCount(),
    );
    return of(kpis).pipe(delay(MOCK_LATENCY));
  }

  /** The dashboard queue widgets: pending verifications, latest sign-ups, recent fraud. */
  getWidgets(recentLimit = 5): Observable<AdminDashboardWidgets> {
    if (!environment.useMock) {
      return this.api.get<AdminDashboardWidgets>(`${ENDPOINT}/widgets`, { recentLimit });
    }
    // Latest sign-ups come from the shared user service (newest-first), so a
    // suspension in the user management screen is reflected here too; the
    // verification queue comes from the shared store (matches the nav badge).
    return this.userService.list({ page: 1, pageSize: recentLimit }).pipe(
      map((signups) => ({
        pendingVerifications: this.verificationStore.pendingQueue().slice(0, recentLimit),
        recentSignups: signups.data,
        recentFraudSignals: this.fraudService
          .snapshot()
          .filter((signal) => !signal.resolved)
          .sort((a, b) => Date.parse(b.detectedAt) - Date.parse(a.detectedAt))
          .slice(0, recentLimit),
      })),
    );
  }
}
