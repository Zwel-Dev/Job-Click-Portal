import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { Id, Paginated } from '@core/models/common.model';
import { AuditLogEntry } from '@core/models/admin-platform.model';
import { AuditAction } from '@core/enums/audit-action.enum';
import { AuditLogQuery } from '../models/audit-log.model';
import { MOCK_AUDIT_LOGS } from './mock/mock-admin-audit';

const MOCK_LATENCY = 400;
const ENDPOINT = '/api/v1/admin/audit-logs';

/** What a caller supplies when recording an action; actor + time are stamped here. */
export interface AuditRecordInput {
  action: AuditAction;
  entityType: string;
  entityId: Id;
  summary: string;
}

/**
 * Platform audit trail. Read-only to the UI; every mutating admin action across
 * PA1.x/PA2.x calls `record()` so the trail is the authority on who did what
 * (§11). Stateful mock — session actions prepend to the seeded history.
 */
@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly api = inject(ApiBaseService);
  private readonly currentUser = inject(CurrentUserStore);

  private entries: AuditLogEntry[] = clone([...MOCK_AUDIT_LOGS]);
  private nextId = 1000;

  /** Append an entry for the current admin (mock only; the server logs in real mode). */
  record(input: AuditRecordInput): void {
    const entry: AuditLogEntry = {
      id: this.nextId++,
      actorName: this.currentUser.displayName() || 'System',
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      createdAt: new Date().toISOString(),
    };
    this.entries = [entry, ...this.entries];
  }

  /** Paginated, filtered, newest-first list. */
  list(query: AuditLogQuery): Observable<Paginated<AuditLogEntry>> {
    if (!environment.useMock) {
      return this.api.getPaginated<AuditLogEntry>(ENDPOINT, {
        actor: query.actor,
        action: query.action,
        entityType: query.entityType,
        from: query.from,
        to: query.to,
        page: query.page,
        pageSize: query.pageSize,
      });
    }

    let items = [...this.entries];
    const actor = query.actor?.trim().toLowerCase();
    if (actor) {
      items = items.filter((entry) => entry.actorName.toLowerCase().includes(actor));
    }
    if (query.action) {
      items = items.filter((entry) => entry.action === query.action);
    }
    if (query.entityType) {
      items = items.filter((entry) => entry.entityType === query.entityType);
    }
    if (query.from) {
      const from = Date.parse(query.from);
      items = items.filter((entry) => Date.parse(entry.createdAt) >= from);
    }
    if (query.to) {
      // Inclusive of the whole "to" day.
      const to = Date.parse(query.to) + 24 * 60 * 60 * 1000;
      items = items.filter((entry) => Date.parse(entry.createdAt) < to);
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
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
