import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { ApiError, Id, Paginated } from '@core/models/common.model';
import { AdminUser, AdminUserQuery } from '@core/models/admin-user.model';
import { UserStatus } from '@core/enums/user-status.enum';
import { AuditAction } from '@core/enums/audit-action.enum';
import { AuditLogService } from './audit-log.service';
import { MOCK_ADMIN_USERS } from './mock/mock-admin-data';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/admin/users';

/**
 * Platform-admin user directory. Stateful mock so suspend / reactivate persist
 * for the session; real branch via `ApiBaseService` (`/admin/users`). This is
 * the single source of truth for users — the dashboard sign-ups widget reads it
 * too, so a suspension here is reflected everywhere.
 */
@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly api = inject(ApiBaseService);
  private readonly audit = inject(AuditLogService);

  private users: AdminUser[] = clone([...MOCK_ADMIN_USERS]);

  /** Paginated, filtered, newest-first list. */
  list(query: AdminUserQuery): Observable<Paginated<AdminUser>> {
    if (!environment.useMock) {
      return this.api.getPaginated<AdminUser>(ENDPOINT, {
        keyword: query.keyword,
        role: query.role,
        status: query.status,
        page: query.page,
        pageSize: query.pageSize,
      });
    }

    let items = [...this.users];
    const keyword = query.keyword?.trim().toLowerCase();
    if (keyword) {
      items = items.filter(
        (user) =>
          user.fullName.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          (user.companyName?.toLowerCase().includes(keyword) ?? false),
      );
    }
    if (query.role) {
      items = items.filter((user) => user.roles.includes(query.role!));
    }
    if (query.status) {
      items = items.filter((user) => user.status === query.status);
    }
    items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

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

  getById(id: Id): Observable<AdminUser> {
    if (!environment.useMock) {
      return this.api.get<AdminUser>(`${ENDPOINT}/${id}`);
    }
    const user = this.users.find((item) => item.id === id);
    if (!user) {
      return throwError(() => userNotFound()).pipe(delay(MOCK_LATENCY));
    }
    return of(clone(user)).pipe(delay(MOCK_LATENCY));
  }

  /** Suspend / reactivate (and any future status transition). */
  setStatus(id: Id, status: UserStatus): Observable<AdminUser> {
    if (!environment.useMock) {
      return this.api.patch<AdminUser>(`${ENDPOINT}/${id}/status`, { status });
    }
    const existing = this.users.find((item) => item.id === id);
    if (!existing) {
      return throwError(() => userNotFound()).pipe(delay(MOCK_LATENCY));
    }
    const updated: AdminUser = { ...existing, status };
    this.users = this.users.map((item) => (item.id === id ? updated : item));
    const suspending = status === UserStatus.Suspended;
    this.audit.record({
      action: suspending ? AuditAction.Suspend : AuditAction.Reactivate,
      entityType: 'User',
      entityId: id,
      summary: `${suspending ? 'Suspended' : 'Reactivated'} user ${updated.fullName}`,
    });
    return of(clone(updated)).pipe(delay(MOCK_LATENCY));
  }

  /** Sends a reset link; never returns or reveals the password. */
  resetPassword(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.post<void>(`${ENDPOINT}/${id}/reset-password`, {});
    }
    const existing = this.users.find((item) => item.id === id);
    if (!existing) {
      return throwError(() => userNotFound()).pipe(delay(MOCK_LATENCY));
    }
    this.audit.record({
      action: AuditAction.Update,
      entityType: 'User',
      entityId: id,
      summary: `Sent password reset link to ${existing.email}`,
    });
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }
}

function userNotFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'User not found.' };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
