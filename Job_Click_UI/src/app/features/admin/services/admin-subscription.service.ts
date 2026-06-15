import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { Id, Paginated } from '@core/models/common.model';
import {
  AdminSubscription,
  AdminSubscriptionQuery,
  BillingSummary,
  Payment,
} from '@core/models/admin-subscription.model';
import {
  MOCK_ADMIN_SUBSCRIPTIONS,
  MOCK_PAYMENTS,
  buildBillingSummary,
} from './mock/mock-admin-billing';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/admin/subscriptions';

/**
 * Platform-admin subscription oversight (read-only) — all company subscriptions
 * plus payments/invoices. Mock branch gated on `environment.useMock`; real branch
 * via `ApiBaseService`. Ties to the Subscription & Billing module (doc 08).
 */
@Injectable({ providedIn: 'root' })
export class AdminSubscriptionService {
  private readonly api = inject(ApiBaseService);

  /** Headline billing metrics for the KPI strip. */
  summary(): Observable<BillingSummary> {
    if (!environment.useMock) {
      return this.api.get<BillingSummary>(`${ENDPOINT}/summary`);
    }
    return of(buildBillingSummary()).pipe(delay(MOCK_LATENCY));
  }

  /** Paginated, filtered subscription list (newest first). */
  list(query: AdminSubscriptionQuery): Observable<Paginated<AdminSubscription>> {
    if (!environment.useMock) {
      return this.api.getPaginated<AdminSubscription>(ENDPOINT, {
        keyword: query.keyword,
        plan: query.planName,
        status: query.status,
        page: query.page,
        pageSize: query.pageSize,
      });
    }

    let items = [...MOCK_ADMIN_SUBSCRIPTIONS];
    const keyword = query.keyword?.trim().toLowerCase();
    if (keyword) {
      items = items.filter(
        (sub) =>
          sub.companyName.toLowerCase().includes(keyword) ||
          sub.companyCode.toLowerCase().includes(keyword),
      );
    }
    if (query.planName) {
      items = items.filter((sub) => sub.planName === query.planName);
    }
    if (query.status) {
      items = items.filter((sub) => sub.status === query.status);
    }
    items.sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate));

    const totalItems = items.length;
    const start = (query.page - 1) * query.pageSize;
    const data = clone(items.slice(start, start + query.pageSize));
    return of({
      data,
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
    }).pipe(delay(MOCK_LATENCY));
  }

  /** Payments / invoices for one company, newest first. */
  payments(companyId: Id): Observable<Payment[]> {
    if (!environment.useMock) {
      return this.api.get<Payment[]>(`${ENDPOINT}/${companyId}/payments`);
    }
    const items = MOCK_PAYMENTS.filter((payment) => payment.companyId === companyId).sort(
      (a, b) => Date.parse(b.paidAt) - Date.parse(a.paidAt),
    );
    return of(clone(items)).pipe(delay(MOCK_LATENCY));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
