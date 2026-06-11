import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { ApiError } from '@core/models/common.model';
import { MOCK_DEMO_PASSWORD } from '@core/auth/mock/mock-users';
import {
  AccountUpdateRequest,
  ChangePasswordRequest,
  NotificationPreferences,
} from '../models/settings.model';

const MOCK_LATENCY = 500;

/** Candidate account / privacy / notification settings (mock backend). */
@Injectable({ providedIn: 'root' })
export class CandidateSettingsService {
  private readonly api = inject(ApiBaseService);

  private preferences: NotificationPreferences = {
    email: true,
    sms: false,
    push: true,
    applicationUpdates: true,
    interviewInvitations: true,
    jobRecommendations: true,
    recruiterMessages: false,
  };

  getNotificationPreferences(): Observable<NotificationPreferences> {
    return environment.useMock
      ? of({ ...this.preferences }).pipe(delay(MOCK_LATENCY))
      : this.api.get<NotificationPreferences>(API.candidate.notificationPreferences);
  }

  saveNotificationPreferences(prefs: NotificationPreferences): Observable<NotificationPreferences> {
    if (!environment.useMock) {
      return this.api.put<NotificationPreferences>(API.candidate.notificationPreferences, prefs);
    }
    this.preferences = { ...prefs };
    return of({ ...this.preferences }).pipe(delay(MOCK_LATENCY));
  }

  updateAccount(request: AccountUpdateRequest): Observable<void> {
    return environment.useMock
      ? of(undefined).pipe(delay(MOCK_LATENCY))
      : this.api.put<void>(API.candidate.account, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    if (!environment.useMock) {
      return this.api.post<void>(API.candidate.password, request);
    }
    if (request.currentPassword !== MOCK_DEMO_PASSWORD) {
      const error: ApiError = {
        status: 422,
        code: 'INVALID_PASSWORD',
        message: 'Your current password is incorrect.',
      };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }
}
