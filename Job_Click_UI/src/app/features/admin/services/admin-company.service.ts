import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { ApiError, Id, Paginated } from '@core/models/common.model';
import { AdminCompany, AdminCompanyDetail, AdminCompanyQuery } from '@core/models/admin-company.model';
import { CompanyStatus } from '@core/enums/company-status.enum';
import { AuditAction } from '@core/enums/audit-action.enum';
import { VerificationStore } from '@core/state/verification.store';
import { AuditLogService } from './audit-log.service';
import { MOCK_ADMIN_COMPANIES, buildAdminCompanyDetail } from './mock/mock-admin-data';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/admin/companies';

/**
 * Platform-admin company directory. Stateful mock so suspend / activate persist
 * for the session; real branch via `ApiBaseService` (`/admin/companies`).
 * Suspending a company gates its whole employer workspace (enforced server-side).
 */
@Injectable({ providedIn: 'root' })
export class AdminCompanyService {
  private readonly api = inject(ApiBaseService);
  // Verification status/badge are owned by the shared store, so an approval in
  // the verification queue is reflected in this list and the detail page.
  private readonly verificationStore = inject(VerificationStore);
  private readonly audit = inject(AuditLogService);

  private companies: AdminCompany[] = clone([...MOCK_ADMIN_COMPANIES]);

  /** Paginated, filtered, newest-first list. */
  list(query: AdminCompanyQuery): Observable<Paginated<AdminCompany>> {
    if (!environment.useMock) {
      return this.api.getPaginated<AdminCompany>(ENDPOINT, {
        keyword: query.keyword,
        status: query.status,
        verified: query.verified,
        page: query.page,
        pageSize: query.pageSize,
      });
    }

    let items = this.companies.map((company) => this.withVerification(company));
    const keyword = query.keyword?.trim().toLowerCase();
    if (keyword) {
      items = items.filter(
        (company) =>
          company.name.toLowerCase().includes(keyword) ||
          company.companyCode.toLowerCase().includes(keyword) ||
          (company.industry?.toLowerCase().includes(keyword) ?? false),
      );
    }
    if (query.status) {
      items = items.filter((company) => company.status === query.status);
    }
    if (query.verified !== undefined) {
      items = items.filter((company) => company.verified === query.verified);
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

  getById(id: Id): Observable<AdminCompanyDetail> {
    if (!environment.useMock) {
      return this.api.get<AdminCompanyDetail>(`${ENDPOINT}/${id}`);
    }
    const company = this.companies.find((item) => item.id === id);
    if (!company) {
      return throwError(() => companyNotFound()).pipe(delay(MOCK_LATENCY));
    }
    return of(clone(buildAdminCompanyDetail(this.withVerification(company)))).pipe(delay(MOCK_LATENCY));
  }

  /** Overlays the authoritative verification status/badge from the shared store. */
  private withVerification(company: AdminCompany): AdminCompany {
    return {
      ...company,
      verificationStatus: this.verificationStore.statusFor(company.id),
      verified: this.verificationStore.isVerified(company.id),
    };
  }

  /** Suspend / activate. */
  setStatus(id: Id, status: CompanyStatus): Observable<AdminCompany> {
    if (!environment.useMock) {
      return this.api.patch<AdminCompany>(`${ENDPOINT}/${id}/status`, { status });
    }
    const existing = this.companies.find((item) => item.id === id);
    if (!existing) {
      return throwError(() => companyNotFound()).pipe(delay(MOCK_LATENCY));
    }
    const updated: AdminCompany = { ...existing, status };
    this.companies = this.companies.map((item) => (item.id === id ? updated : item));
    const suspending = status === CompanyStatus.Suspended;
    this.audit.record({
      action: suspending ? AuditAction.Suspend : AuditAction.Reactivate,
      entityType: 'Company',
      entityId: id,
      summary: `${suspending ? 'Suspended' : 'Reactivated'} company ${updated.name}`,
    });
    return of(clone(updated)).pipe(delay(MOCK_LATENCY));
  }
}

function companyNotFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'Company not found.' };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
