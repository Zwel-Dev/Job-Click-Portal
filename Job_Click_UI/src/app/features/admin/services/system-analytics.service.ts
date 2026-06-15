import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { SystemAnalytics } from '@core/models/system-analytics.model';
import { MOCK_SYSTEM_ANALYTICS } from './mock/mock-admin-analytics';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/admin/analytics';

/** Platform-wide analytics (read-only). Mock gated on `environment.useMock`. */
@Injectable({ providedIn: 'root' })
export class SystemAnalyticsService {
  private readonly api = inject(ApiBaseService);

  load(): Observable<SystemAnalytics> {
    if (!environment.useMock) {
      return this.api.get<SystemAnalytics>(ENDPOINT);
    }
    return of(clone(MOCK_SYSTEM_ANALYTICS)).pipe(delay(MOCK_LATENCY));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
