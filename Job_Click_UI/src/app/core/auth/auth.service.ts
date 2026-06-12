import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { ApiError, Id } from '@core/models/common.model';
import { User } from '@core/models/user.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { UserStatus } from '@core/enums/user-status.enum';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import {
  AuthSession,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterCandidateRequest,
  RegisterCompanyRequest,
  RegisterResult,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from '@core/models/auth.model';
import { TokenStorageService } from './token-storage.service';
import { CurrentUserStore } from './current-user.store';
import { MOCK_AUTH_USERS, buildMockSession } from './mock/mock-users';

/**
 * Authentication API. In mock mode every method returns simulated data via
 * `of(...)` with latency, so swapping to the real ASP.NET Core backend only
 * requires flipping `environment.useMock` — no component changes.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiBaseService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly currentUser = inject(CurrentUserStore);

  private readonly mockLatencyMs = 600;
  private nextMockUserId = 1000;

  /** Rehydrates the in-memory user from a persisted session (called on app start). */
  restoreSession(): void {
    const session = this.tokenStorage.session;
    if (session) {
      this.currentUser.setUser(session.user);
    }
  }

  login(request: LoginRequest): Observable<AuthSession> {
    const source$ = environment.useMock
      ? this.mockLogin(request)
      : this.api.post<AuthSession>(API.auth.login, request);

    return source$.pipe(
      tap((session) => {
        this.tokenStorage.save(session, request.rememberMe);
        this.currentUser.setUser(session.user);
      }),
    );
  }

  logout(): void {
    if (!environment.useMock) {
      this.api.post<void>(API.auth.logout, {}).subscribe({ error: () => undefined });
    }
    this.tokenStorage.clear();
    this.currentUser.setUser(null);
  }

  registerCandidate(request: RegisterCandidateRequest): Observable<RegisterResult> {
    return environment.useMock
      ? this.mockRegister(request.email)
      : this.api.post<RegisterResult>(API.auth.registerCandidate, request);
  }

  registerCompany(request: RegisterCompanyRequest): Observable<RegisterResult> {
    return environment.useMock
      ? this.mockRegister(request.workEmail)
      : this.api.post<RegisterResult>(API.auth.registerCompany, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return environment.useMock
      ? of(undefined).pipe(delay(this.mockLatencyMs))
      : this.api.post<void>(API.auth.forgotPassword, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return environment.useMock
      ? of(undefined).pipe(delay(this.mockLatencyMs))
      : this.api.post<void>(API.auth.resetPassword, request);
  }

  verifyOtp(request: VerifyOtpRequest): Observable<void> {
    if (!environment.useMock) {
      return this.api.post<void>(API.auth.verify, request);
    }
    // Mock: accept "123456", reject anything else.
    return request.code === '123456'
      ? of(undefined).pipe(delay(this.mockLatencyMs))
      : throwError(() => this.error(422, 'INVALID_OTP', 'The verification code is invalid or expired.')).pipe(
          delay(this.mockLatencyMs),
        );
  }

  /** Adds a company membership (role) to the signed-in user — invite accept, existing account. */
  addMembership(role: RoleCode, companyId: Id, companyName: string): void {
    const user = this.currentUser.user();
    if (!user) {
      return;
    }
    const roles = user.roles.includes(role) ? user.roles : [...user.roles, role];
    this.persistUser({ ...user, roles, companyId, companyName });
  }

  /** Registers a brand-new user from an invitation and signs them in (mock). */
  acceptInviteAsNewUser(input: {
    email: string;
    fullName: string;
    role: RoleCode;
    companyId: Id;
    companyName: string;
  }): Observable<AuthSession> {
    const id = this.nextMockUserId++;
    const user: User = {
      id,
      uuid: `invited-${id}`,
      email: input.email,
      fullName: input.fullName,
      status: UserStatus.Active,
      emailVerified: true,
      phoneVerified: false,
      roles: [input.role],
      companyId: input.companyId,
      companyName: input.companyName,
    };
    const session: AuthSession = {
      token: `mock.invited.${id}`,
      refreshToken: `mock-refresh.${id}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      user,
    };
    return of(session).pipe(
      delay(this.mockLatencyMs),
      tap((created) => {
        this.tokenStorage.save(created, false);
        this.currentUser.setUser(created.user);
      }),
    );
  }

  private persistUser(user: User): void {
    const session = this.tokenStorage.session;
    if (session) {
      const remember = localStorage.getItem(STORAGE_KEYS.authSession) !== null;
      this.tokenStorage.save({ ...session, user }, remember);
    }
    this.currentUser.setUser(user);
  }

  // --- Mock backend ---------------------------------------------------------

  private mockLogin(request: LoginRequest): Observable<AuthSession> {
    const match = MOCK_AUTH_USERS.find(
      (user) => user.email.toLowerCase() === request.email.trim().toLowerCase(),
    );

    if (!match || match.password !== request.password) {
      return throwError(() =>
        this.error(401, 'INVALID_CREDENTIALS', 'Invalid email or password.'),
      ).pipe(delay(this.mockLatencyMs));
    }

    return of(buildMockSession(match)).pipe(delay(this.mockLatencyMs));
  }

  private mockRegister(email: string): Observable<RegisterResult> {
    const exists = MOCK_AUTH_USERS.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return throwError(() =>
        this.error(409, 'EMAIL_TAKEN', 'An account with this email already exists.'),
      ).pipe(delay(this.mockLatencyMs));
    }

    const result: RegisterResult = {
      userId: this.nextMockUserId++,
      email,
      requiresVerification: true,
    };
    return of(result).pipe(delay(this.mockLatencyMs));
  }

  private error(status: number, code: string, message: string): ApiError {
    return { status, code, message };
  }
}
