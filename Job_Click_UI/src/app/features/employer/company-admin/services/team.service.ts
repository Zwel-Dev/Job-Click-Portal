import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { InvitationService } from '@core/services/invitation.service';
import { ApiError, Id } from '@core/models/common.model';
import { InviteRequest, RoleChange, TeamMember } from '@core/models/team.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { MemberStatus } from '@core/enums/member-status.enum';
import { InvitationStatus } from '@core/enums/invitation-status.enum';
import { MOCK_TEAM } from './mock/mock-team';

const MOCK_LATENCY = 400;
const ENDPOINT = '/api/v1/employer/team';

const ROLE_ORDER: Record<RoleCode, number> = {
  [RoleCode.CompanyAdmin]: 0,
  [RoleCode.RecruitmentManager]: 1,
  [RoleCode.Recruiter]: 2,
  [RoleCode.HiringManager]: 3,
  [RoleCode.PlatformAdmin]: 4,
  [RoleCode.Candidate]: 5,
};

/**
 * Company team management. Stateful mock; enforces the last-admin invariant
 * (the only Company Admin can't be demoted/deactivated/removed — transfer first).
 */
@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly api = inject(ApiBaseService);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly invitations = inject(InvitationService);

  private members: TeamMember[] = clone(MOCK_TEAM);
  private nextId = 200;

  list(): Observable<TeamMember[]> {
    if (!environment.useMock) {
      return this.api.get<TeamMember[]>(ENDPOINT);
    }
    // Reflect invitations accepted via the Auth accept page (Invited → Active).
    const merged = this.sorted().map((member) =>
      member.status === MemberStatus.Invited &&
      this.invitations.statusForEmail(member.email) === InvitationStatus.Accepted
        ? { ...member, status: MemberStatus.Active, joinedAt: new Date().toISOString() }
        : member,
    );
    return of(clone(merged)).pipe(delay(MOCK_LATENCY));
  }

  invite(request: InviteRequest): Observable<TeamMember> {
    if (!environment.useMock) {
      return this.api.post<TeamMember>(`${ENDPOINT}/invites`, request);
    }
    if (this.members.some((member) => member.email.toLowerCase() === request.email.toLowerCase())) {
      return throwError(() => conflict('That email is already on your team.')).pipe(delay(MOCK_LATENCY));
    }
    const member: TeamMember = {
      userId: this.nextId++,
      fullName: nameFromEmail(request.email),
      email: request.email,
      role: request.role,
      status: MemberStatus.Invited,
      jobsOwned: 0,
      invitedAt: new Date().toISOString(),
    };
    this.members = [...this.members, member];
    const inviter = this.currentUser.user();
    this.invitations.issue({
      email: request.email,
      role: request.role,
      companyId: inviter?.companyId ?? 0,
      companyName: inviter?.companyName ?? '',
      invitedBy: inviter?.id ?? 0,
      invitedByName: inviter?.fullName ?? 'An admin',
    });
    return of(clone(member)).pipe(delay(MOCK_LATENCY));
  }

  /** Accept link for a pending invite — surrogate for the email (mock). */
  inviteLink(userId: Id): Observable<string> {
    const member = this.find(userId);
    if (!member) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    const path = this.invitations.linkForEmail(member.email);
    if (!path) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    return of(path).pipe(delay(MOCK_LATENCY));
  }

  resendInvite(userId: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.post<void>(`${ENDPOINT}/invites/${userId}/resend`, {});
    }
    const member = this.find(userId);
    if (member) {
      this.invitations.resendByEmail(member.email);
    }
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  revokeInvite(userId: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${ENDPOINT}/invites/${userId}`);
    }
    const member = this.find(userId);
    if (member?.role === RoleCode.CompanyAdmin && this.adminCount() <= 1) {
      return throwError(() => lastAdmin()).pipe(delay(MOCK_LATENCY));
    }
    if (member) {
      this.invitations.revokeByEmail(member.email);
    }
    this.members = this.members.filter((item) => item.userId !== userId);
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  changeRole(change: RoleChange): Observable<TeamMember> {
    if (!environment.useMock) {
      return this.api.put<TeamMember>(`${ENDPOINT}/${change.userId}/role`, { role: change.role });
    }
    const member = this.find(change.userId);
    if (!member) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    if (member.role === RoleCode.CompanyAdmin && change.role !== RoleCode.CompanyAdmin && this.adminCount() <= 1) {
      return throwError(() => lastAdmin()).pipe(delay(MOCK_LATENCY));
    }
    const updated = { ...member, role: change.role };
    this.members = this.members.map((item) => (item.userId === change.userId ? updated : item));
    return of(clone(updated)).pipe(delay(MOCK_LATENCY));
  }

  setStatus(userId: Id, status: MemberStatus): Observable<TeamMember> {
    if (!environment.useMock) {
      return this.api.put<TeamMember>(`${ENDPOINT}/${userId}/status`, { status });
    }
    const member = this.find(userId);
    if (!member) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    if (
      status === MemberStatus.Deactivated &&
      member.role === RoleCode.CompanyAdmin &&
      this.activeAdminCount() <= 1
    ) {
      return throwError(() => lastAdmin()).pipe(delay(MOCK_LATENCY));
    }
    const updated = { ...member, status };
    this.members = this.members.map((item) => (item.userId === userId ? updated : item));
    return of(clone(updated)).pipe(delay(MOCK_LATENCY));
  }

  /** Reassigns Company Admin to `userId`; the current admin becomes a Recruitment Manager. */
  transferOwnership(userId: Id): Observable<TeamMember[]> {
    if (!environment.useMock) {
      return this.api.post<TeamMember[]>(`${ENDPOINT}/${userId}/transfer-ownership`, {});
    }
    const target = this.find(userId);
    if (!target) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    const actingId = this.currentUser.user()?.id;
    this.members = this.members.map((member) => {
      if (member.userId === userId) {
        return { ...member, role: RoleCode.CompanyAdmin, status: MemberStatus.Active };
      }
      if (member.userId === actingId && member.role === RoleCode.CompanyAdmin) {
        return { ...member, role: RoleCode.RecruitmentManager };
      }
      return member;
    });
    return of(clone(this.sorted())).pipe(delay(MOCK_LATENCY));
  }

  private adminCount(): number {
    return this.members.filter((member) => member.role === RoleCode.CompanyAdmin).length;
  }

  private activeAdminCount(): number {
    return this.members.filter(
      (member) => member.role === RoleCode.CompanyAdmin && member.status === MemberStatus.Active,
    ).length;
  }

  private find(userId: Id): TeamMember | undefined {
    return this.members.find((member) => member.userId === userId);
  }

  private sorted(): TeamMember[] {
    return [...this.members].sort(
      (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.fullName.localeCompare(b.fullName),
    );
  }
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function lastAdmin(): ApiError {
  return { status: 409, code: 'LAST_ADMIN', message: 'Transfer ownership before changing the only Company Admin.' };
}

function conflict(message: string): ApiError {
  return { status: 409, code: 'CONFLICT', message };
}

function notFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'Team member not found.' };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
