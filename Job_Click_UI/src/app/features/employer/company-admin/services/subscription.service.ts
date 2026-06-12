import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { PlanUsage, Subscription, SubscriptionPlan } from '@core/models/subscription.model';
import { MOCK_PLAN_USAGE } from './mock/mock-company';
import { MOCK_SUBSCRIPTION, SUBSCRIPTION_PLANS } from './mock/mock-subscription';

const MOCK_LATENCY = 400;
const ENDPOINT = '/api/v1/employer/subscription';

/**
 * Subscription & plan usage (read-only entry point). Full checkout/billing lives
 * in the Subscription & Billing module (doc 08).
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiBaseService);

  current(): Observable<Subscription> {
    if (!environment.useMock) {
      return this.api.get<Subscription>(ENDPOINT);
    }
    return of(clone(MOCK_SUBSCRIPTION)).pipe(delay(MOCK_LATENCY));
  }

  usage(): Observable<PlanUsage> {
    if (!environment.useMock) {
      return this.api.get<PlanUsage>(`${ENDPOINT}/usage`);
    }
    return of(clone(MOCK_PLAN_USAGE)).pipe(delay(MOCK_LATENCY));
  }

  plans(): Observable<SubscriptionPlan[]> {
    if (!environment.useMock) {
      return this.api.get<SubscriptionPlan[]>(`${ENDPOINT}/plans`);
    }
    return of(clone(SUBSCRIPTION_PLANS)).pipe(delay(MOCK_LATENCY));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
