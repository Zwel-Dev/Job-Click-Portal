import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { ApiError, Id } from '@core/models/common.model';
import { SubscriptionPlan } from '@core/models/subscription.model';
import { AuditAction } from '@core/enums/audit-action.enum';
import { FeatureFlag, PlanFormValue, RoleInfo, Skill, SkillFormValue } from '../models/platform-settings.model';
import { AuditLogService } from './audit-log.service';
import {
  MOCK_FEATURE_FLAGS,
  MOCK_SETTINGS_PLANS,
  MOCK_SKILLS,
  ROLE_INFO,
} from './mock/mock-admin-settings';

const MOCK_LATENCY = 400;
const ENDPOINT = '/api/v1/admin/settings';

/**
 * Platform settings — roles (read-only), skills taxonomy, plans, and feature
 * flags. Stateful mock so edits persist for the session; every change records an
 * audit entry. Skills/plans edits would propagate to candidate/job pickers and
 * the matching engine in the real backend (doc 06).
 */
@Injectable({ providedIn: 'root' })
export class PlatformSettingsService {
  private readonly api = inject(ApiBaseService);
  private readonly audit = inject(AuditLogService);

  private skillList: Skill[] = clone([...MOCK_SKILLS]);
  private planList: SubscriptionPlan[] = clone([...MOCK_SETTINGS_PLANS]);
  private flagList: FeatureFlag[] = clone([...MOCK_FEATURE_FLAGS]);
  private nextSkillId = 100;
  private nextPlanId = 100;

  // --- Roles (read-only) ----------------------------------------------------

  roles(): Observable<RoleInfo[]> {
    if (!environment.useMock) {
      return this.api.get<RoleInfo[]>(`${ENDPOINT}/roles`);
    }
    return of(clone([...ROLE_INFO])).pipe(delay(MOCK_LATENCY));
  }

  // --- Skills taxonomy ------------------------------------------------------

  skills(): Observable<Skill[]> {
    if (!environment.useMock) {
      return this.api.get<Skill[]>(`${ENDPOINT}/skills`);
    }
    const sorted = [...this.skillList].sort((a, b) => a.name.localeCompare(b.name));
    return of(clone(sorted)).pipe(delay(MOCK_LATENCY));
  }

  saveSkill(value: SkillFormValue, id?: Id): Observable<Skill> {
    if (!environment.useMock) {
      return id
        ? this.api.put<Skill>(`${ENDPOINT}/skills/${id}`, value)
        : this.api.post<Skill>(`${ENDPOINT}/skills`, value);
    }
    let saved: Skill;
    if (id) {
      const existing = this.skillList.find((skill) => skill.id === id);
      if (!existing) {
        return throwError(() => notFound('Skill')).pipe(delay(MOCK_LATENCY));
      }
      saved = { ...existing, ...value };
      this.skillList = this.skillList.map((skill) => (skill.id === id ? saved : skill));
    } else {
      saved = { id: this.nextSkillId++, ...value };
      this.skillList = [...this.skillList, saved];
    }
    this.audit.record({
      action: id ? AuditAction.Update : AuditAction.Create,
      entityType: 'Skill',
      entityId: saved.id,
      summary: `${id ? 'Updated' : 'Added'} skill "${saved.name}"`,
    });
    return of(clone(saved)).pipe(delay(MOCK_LATENCY));
  }

  removeSkill(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${ENDPOINT}/skills/${id}`);
    }
    const existing = this.skillList.find((skill) => skill.id === id);
    if (!existing) {
      return throwError(() => notFound('Skill')).pipe(delay(MOCK_LATENCY));
    }
    this.skillList = this.skillList.filter((skill) => skill.id !== id);
    this.audit.record({ action: AuditAction.Delete, entityType: 'Skill', entityId: id, summary: `Removed skill "${existing.name}"` });
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  // --- Plans ----------------------------------------------------------------

  plans(): Observable<SubscriptionPlan[]> {
    if (!environment.useMock) {
      return this.api.get<SubscriptionPlan[]>(`${ENDPOINT}/plans`);
    }
    return of(clone([...this.planList])).pipe(delay(MOCK_LATENCY));
  }

  savePlan(value: PlanFormValue, id?: Id): Observable<SubscriptionPlan> {
    if (!environment.useMock) {
      return id
        ? this.api.put<SubscriptionPlan>(`${ENDPOINT}/plans/${id}`, value)
        : this.api.post<SubscriptionPlan>(`${ENDPOINT}/plans`, value);
    }
    let saved: SubscriptionPlan;
    if (id) {
      const existing = this.planList.find((plan) => plan.id === id);
      if (!existing) {
        return throwError(() => notFound('Plan')).pipe(delay(MOCK_LATENCY));
      }
      saved = { ...existing, ...value };
      this.planList = this.planList.map((plan) => (plan.id === id ? saved : plan));
    } else {
      saved = { id: this.nextPlanId++, currency: 'USD', ...value };
      this.planList = [...this.planList, saved];
    }
    this.audit.record({
      action: id ? AuditAction.Update : AuditAction.Create,
      entityType: 'Plan',
      entityId: saved.id,
      summary: `${id ? 'Updated' : 'Added'} plan "${saved.name}"`,
    });
    return of(clone(saved)).pipe(delay(MOCK_LATENCY));
  }

  removePlan(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${ENDPOINT}/plans/${id}`);
    }
    const existing = this.planList.find((plan) => plan.id === id);
    if (!existing) {
      return throwError(() => notFound('Plan')).pipe(delay(MOCK_LATENCY));
    }
    this.planList = this.planList.filter((plan) => plan.id !== id);
    this.audit.record({ action: AuditAction.Delete, entityType: 'Plan', entityId: id, summary: `Removed plan "${existing.name}"` });
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  // --- Feature flags --------------------------------------------------------

  flags(): Observable<FeatureFlag[]> {
    if (!environment.useMock) {
      return this.api.get<FeatureFlag[]>(`${ENDPOINT}/flags`);
    }
    return of(clone([...this.flagList])).pipe(delay(MOCK_LATENCY));
  }

  setFlag(id: Id, enabled: boolean): Observable<FeatureFlag> {
    if (!environment.useMock) {
      return this.api.patch<FeatureFlag>(`${ENDPOINT}/flags/${id}`, { enabled });
    }
    const existing = this.flagList.find((flag) => flag.id === id);
    if (!existing) {
      return throwError(() => notFound('Feature flag')).pipe(delay(MOCK_LATENCY));
    }
    const saved: FeatureFlag = { ...existing, enabled };
    this.flagList = this.flagList.map((flag) => (flag.id === id ? saved : flag));
    this.audit.record({
      action: AuditAction.Update,
      entityType: 'Feature flag',
      entityId: id,
      summary: `${enabled ? 'Enabled' : 'Disabled'} feature flag "${saved.label}"`,
    });
    return of(clone(saved)).pipe(delay(MOCK_LATENCY));
  }
}

function notFound(entity: string): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: `${entity} not found.` };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
