import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ApiError, Id } from '@core/models/common.model';
import { AuthSession } from '@core/models/auth.model';
import { AcceptInviteInput, Invitation, InvitationPreview } from '@core/models/invitation.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { InvitationStatus } from '@core/enums/invitation-status.enum';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { MOCK_AUTH_USERS } from '@core/auth/mock/mock-users';

const MOCK_LATENCY = 400;
const TTL_DAYS = 7;

/**
 * Company invitations — issued by Company Admin (`TeamService`) and accepted on
 * the Auth `/invite/accept` page. An invitation is keyed by **email**, decoupled
 * from any account: accepting either registers a new user or adds a `USER_ROLES`
 * membership to an existing one. Single source of truth for invitation state.
 */
@Injectable({ providedIn: 'root' })
export class InvitationService {
  private readonly currentUser = inject(CurrentUserStore);
  private readonly auth = inject(AuthService);

  private invitations: Invitation[] = clone(MOCK_INVITATIONS);
  private nextId = 300;
  private tokenSeq = 1000;

  /** Issues (or reuses) a pending invitation for an email. */
  issue(input: {
    email: string;
    role: RoleCode;
    companyId: Id;
    companyName: string;
    invitedBy: Id;
    invitedByName: string;
  }): Invitation {
    const existing = this.pendingFor(input.email);
    if (existing) {
      return clone(existing);
    }
    const invitation: Invitation = {
      id: this.nextId++,
      companyId: input.companyId,
      companyName: input.companyName,
      email: input.email,
      role: input.role,
      token: this.newToken(),
      status: InvitationStatus.Pending,
      invitedBy: input.invitedBy,
      invitedByName: input.invitedByName,
      expiresAt: this.expiry(),
      createdAt: new Date().toISOString(),
    };
    this.invitations = [...this.invitations, invitation];
    return clone(invitation);
  }

  getByToken(token: string): Observable<InvitationPreview> {
    const invitation = this.findByToken(token);
    if (!invitation) {
      return of(invalid('not_found')).pipe(delay(MOCK_LATENCY));
    }
    if (invitation.status === InvitationStatus.Revoked) {
      return of(invalid('revoked', invitation)).pipe(delay(MOCK_LATENCY));
    }
    if (invitation.status === InvitationStatus.Accepted) {
      return of(invalid('accepted', invitation)).pipe(delay(MOCK_LATENCY));
    }
    if (this.isExpired(invitation)) {
      return of(invalid('expired', invitation)).pipe(delay(MOCK_LATENCY));
    }
    const preview: InvitationPreview = {
      companyName: invitation.companyName,
      role: invitation.role,
      email: invitation.email,
      needsAccount: !this.accountExists(invitation.email),
      valid: true,
    };
    return of(preview).pipe(delay(MOCK_LATENCY));
  }

  /** No account → register-via-invite, then sign in. */
  acceptAsNewUser(token: string, input: AcceptInviteInput): Observable<AuthSession> {
    const invitation = this.validOrNull(token);
    if (!invitation) {
      return throwError(() => invalidError()).pipe(delay(MOCK_LATENCY));
    }
    return this.auth
      .acceptInviteAsNewUser({
        email: invitation.email,
        fullName: input.fullName,
        role: invitation.role,
        companyId: invitation.companyId,
        companyName: invitation.companyName,
      })
      .pipe(tap((session) => this.markAccepted(invitation, session.user.id)));
  }

  /** Existing account → add the membership to the signed-in user (email must match). */
  acceptAsCurrentUser(token: string): Observable<void> {
    const invitation = this.validOrNull(token);
    if (!invitation) {
      return throwError(() => invalidError()).pipe(delay(MOCK_LATENCY));
    }
    const user = this.currentUser.user();
    if (!user) {
      return throwError(() => err(401, 'NOT_SIGNED_IN', 'Sign in to accept this invitation.')).pipe(delay(MOCK_LATENCY));
    }
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return throwError(() =>
        err(403, 'EMAIL_MISMATCH', `This invitation is for ${invitation.email}.`),
      ).pipe(delay(MOCK_LATENCY));
    }
    this.auth.addMembership(invitation.role, invitation.companyId, invitation.companyName);
    this.markAccepted(invitation, user.id);
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  // --- Consumed by TeamService ---------------------------------------------

  /** Relative accept link for a pending invitation (component prepends the origin). */
  linkForEmail(email: string): string | null {
    const invitation = this.pendingFor(email);
    return invitation ? `/invite/accept?token=${invitation.token}` : null;
  }

  statusForEmail(email: string): InvitationStatus | null {
    const invitation = this.latestFor(email);
    return invitation ? invitation.status : null;
  }

  resendByEmail(email: string): void {
    const invitation = this.pendingFor(email);
    if (invitation) {
      this.update({ ...invitation, token: this.newToken(), expiresAt: this.expiry() });
    }
  }

  revokeByEmail(email: string): void {
    const invitation = this.pendingFor(email);
    if (invitation) {
      this.update({ ...invitation, status: InvitationStatus.Revoked });
    }
  }

  // --- Internals ------------------------------------------------------------

  private validOrNull(token: string): Invitation | null {
    const invitation = this.findByToken(token);
    if (!invitation || invitation.status !== InvitationStatus.Pending || this.isExpired(invitation)) {
      return null;
    }
    return invitation;
  }

  private markAccepted(invitation: Invitation, userId: Id): void {
    this.update({ ...invitation, status: InvitationStatus.Accepted, acceptedUserId: userId });
  }

  private update(invitation: Invitation): void {
    this.invitations = this.invitations.map((item) => (item.id === invitation.id ? invitation : item));
  }

  private findByToken(token: string): Invitation | undefined {
    return this.invitations.find((item) => item.token === token);
  }

  private pendingFor(email: string): Invitation | undefined {
    return this.invitations.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.status === InvitationStatus.Pending,
    );
  }

  private latestFor(email: string): Invitation | undefined {
    return [...this.invitations]
      .filter((item) => item.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }

  private accountExists(email: string): boolean {
    const lower = email.toLowerCase();
    return (
      MOCK_AUTH_USERS.some((user) => user.email.toLowerCase() === lower) ||
      this.currentUser.user()?.email.toLowerCase() === lower
    );
  }

  private isExpired(invitation: Invitation): boolean {
    return new Date(invitation.expiresAt).getTime() < Date.now();
  }

  private newToken(): string {
    return `inv-${(this.tokenSeq++).toString(36)}-${(Date.now() % 100000).toString(36)}`;
  }

  private expiry(): string {
    return new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  }
}

/** Seed invitations for Greenline (company 10) matching the two Invited team rows. */
const MOCK_INVITATIONS: Invitation[] = [
  {
    id: 1, companyId: 10, companyName: 'Greenline Technologies',
    email: 'new.recruiter@greenline.example.com', role: RoleCode.Recruiter, token: 'inv-newrec-7f3a',
    status: InvitationStatus.Pending, invitedBy: 3, invitedByName: 'Nilar Win',
    expiresAt: '2027-12-31T00:00:00Z', createdAt: '2026-06-09T09:00:00Z',
  },
  {
    id: 2, companyId: 10, companyName: 'Greenline Technologies',
    email: 'candidate@jobclick.dev', role: RoleCode.Recruiter, token: 'inv-cand-2b9c',
    status: InvitationStatus.Pending, invitedBy: 3, invitedByName: 'Nilar Win',
    expiresAt: '2027-12-31T00:00:00Z', createdAt: '2026-06-10T09:00:00Z',
  },
];

function invalid(reason: NonNullable<InvitationPreview['reason']>, invitation?: Invitation): InvitationPreview {
  return {
    companyName: invitation?.companyName ?? '',
    role: invitation?.role ?? RoleCode.Recruiter,
    email: invitation?.email ?? '',
    needsAccount: false,
    valid: false,
    reason,
  };
}

function invalidError(): ApiError {
  return err(410, 'INVITE_INVALID', 'This invitation is no longer valid.');
}

function err(status: number, code: string, message: string): ApiError {
  return { status, code, message };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
