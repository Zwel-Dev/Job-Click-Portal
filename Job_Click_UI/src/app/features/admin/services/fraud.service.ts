import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { ApiError, Id } from '@core/models/common.model';
import { FraudSignal } from '@core/models/admin-platform.model';
import { FraudSeverity } from '@core/enums/fraud-severity.enum';
import { CompanyStatus } from '@core/enums/company-status.enum';
import { UserStatus } from '@core/enums/user-status.enum';
import { AuditAction } from '@core/enums/audit-action.enum';
import { FraudActionKind } from '../models/fraud.model';
import { AdminUserService } from './admin-user.service';
import { AdminCompanyService } from './admin-company.service';
import { JobModerationService } from './job-moderation.service';
import { AuditLogService } from './audit-log.service';
import { MOCK_FRAUD_SIGNALS } from './mock/mock-admin-data';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/admin/fraud';

const SEVERITY_RANK: Record<FraudSeverity, number> = {
  [FraudSeverity.High]: 0,
  [FraudSeverity.Medium]: 1,
  [FraudSeverity.Low]: 2,
};

/**
 * Fraud / integrity signals. Stateful mock so resolve / act persist for the
 * session. "Act on" genuinely reuses the entity's own controls — delegating to
 * `AdminUserService` / `AdminCompanyService` (suspend) and `JobModerationService`
 * (remove) — so the user/company/job lists reflect the action too.
 */
@Injectable({ providedIn: 'root' })
export class FraudService {
  private readonly api = inject(ApiBaseService);
  private readonly userService = inject(AdminUserService);
  private readonly companyService = inject(AdminCompanyService);
  private readonly jobService = inject(JobModerationService);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly audit = inject(AuditLogService);

  private signalsState: FraudSignal[] = clone([...MOCK_FRAUD_SIGNALS]);

  /** All signals, open-first then by severity and recency. */
  signals(): Observable<FraudSignal[]> {
    if (!environment.useMock) {
      return this.api.get<FraudSignal[]>(ENDPOINT);
    }
    return of(this.sorted()).pipe(delay(MOCK_LATENCY));
  }

  /** Synchronous snapshot for the dashboard widget/KPIs. */
  snapshot(): FraudSignal[] {
    return clone(this.sorted());
  }

  openCount(): number {
    return this.signalsState.filter((signal) => !signal.resolved).length;
  }

  /** Mark a signal handled without touching the entity. */
  resolve(id: Id): Observable<FraudSignal> {
    if (!environment.useMock) {
      return this.api.post<FraudSignal>(`${ENDPOINT}/${id}/resolve`, {});
    }
    const signal = this.signalsState.find((item) => item.id === id);
    if (signal) {
      this.audit.record({
        action: AuditAction.Update,
        entityType: 'Fraud signal',
        entityId: id,
        summary: `Resolved fraud signal: ${signal.entityLabel}`,
      });
    }
    return this.markResolved(id);
  }

  /** Act on the linked entity (suspend user/company or remove job), then resolve. */
  actOn(signal: FraudSignal, action: FraudActionKind): Observable<FraudSignal> {
    if (!environment.useMock) {
      return this.api.post<FraudSignal>(`${ENDPOINT}/${signal.id}/act`, { action });
    }
    return this.applyAction(signal, action).pipe(switchMap(() => this.markResolved(signal.id)));
  }

  private applyAction(signal: FraudSignal, action: FraudActionKind): Observable<unknown> {
    if (signal.entityId === undefined) {
      return of(undefined);
    }
    if (action === 'suspend') {
      if (signal.entityType === 'company') {
        return this.companyService.setStatus(signal.entityId, CompanyStatus.Suspended);
      }
      if (signal.entityType === 'user') {
        return this.userService.setStatus(signal.entityId, UserStatus.Suspended);
      }
    }
    if (action === 'remove' && signal.entityType === 'job') {
      return this.jobService.remove(signal.entityId);
    }
    return of(undefined);
  }

  private markResolved(id: Id): Observable<FraudSignal> {
    const existing = this.signalsState.find((signal) => signal.id === id);
    if (!existing) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Signal not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    const updated: FraudSignal = { ...existing, resolved: true, resolvedBy: this.currentUser.displayName() };
    this.signalsState = this.signalsState.map((signal) => (signal.id === id ? updated : signal));
    return of(clone(updated)).pipe(delay(MOCK_LATENCY));
  }

  private sorted(): FraudSignal[] {
    return [...this.signalsState].sort((a, b) => {
      if (a.resolved !== b.resolved) {
        return a.resolved ? 1 : -1;
      }
      const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
      if (bySeverity !== 0) {
        return bySeverity;
      }
      return Date.parse(b.detectedAt) - Date.parse(a.detectedAt);
    });
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
