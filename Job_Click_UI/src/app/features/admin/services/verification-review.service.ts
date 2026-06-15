import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { VerificationStore } from '@core/state/verification.store';
import { VerificationDecision, VerificationReviewItem } from '@core/models/verification-review.model';
import { AuditAction } from '@core/enums/audit-action.enum';
import { AuditLogService } from './audit-log.service';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/admin/verifications';

/**
 * Platform-admin verification review API. Delegates to the shared root
 * `VerificationStore` so an Approve flips the company's `Verified` badge on the
 * Company Admin side (CA1.4) — the two screens share one source of truth (§7).
 */
@Injectable({ providedIn: 'root' })
export class VerificationReviewService {
  private readonly api = inject(ApiBaseService);
  private readonly store = inject(VerificationStore);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly audit = inject(AuditLogService);

  /** Companies awaiting review (status === Pending). */
  queue(): Observable<VerificationReviewItem[]> {
    if (!environment.useMock) {
      return this.api.get<VerificationReviewItem[]>(ENDPOINT);
    }
    return of(this.store.pendingQueue()).pipe(delay(MOCK_LATENCY));
  }

  /** Approve (→ Verified, stamps verified_by/at) or reject (→ Rejected + reason). */
  review(decision: VerificationDecision): Observable<void> {
    if (!environment.useMock) {
      return this.api.post<void>(`${ENDPOINT}/${decision.companyId}/review`, decision);
    }
    const companyName =
      this.store.pendingQueue().find((item) => item.companyId === decision.companyId)?.companyName ??
      `company #${decision.companyId}`;
    this.store.review(decision, this.currentUser.displayName());
    this.audit.record({
      action: decision.approve ? AuditAction.Approve : AuditAction.Reject,
      entityType: 'Verification',
      entityId: decision.companyId,
      summary: `${decision.approve ? 'Approved' : 'Rejected'} verification for ${companyName}`,
    });
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }
}
