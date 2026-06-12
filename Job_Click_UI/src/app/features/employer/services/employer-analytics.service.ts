import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { RecruitmentAnalytics } from '../models/employer-analytics.model';
import { MOCK_RECRUITMENT_ANALYTICS } from './mock/mock-analytics';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/employer/analytics';

/** Recruitment analytics aggregates (funnel, time-to-hire, recruiter performance). */
@Injectable({ providedIn: 'root' })
export class EmployerAnalyticsService {
  private readonly api = inject(ApiBaseService);

  load(): Observable<RecruitmentAnalytics> {
    if (!environment.useMock) {
      return this.api.get<RecruitmentAnalytics>(ENDPOINT);
    }
    return of(clone(MOCK_RECRUITMENT_ANALYTICS)).pipe(delay(MOCK_LATENCY));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
