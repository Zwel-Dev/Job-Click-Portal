import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { ApiError, Id } from '@core/models/common.model';
import {
  Company,
  CompanyLocation,
  CompanyLocationFormValue,
  CompanyProfileFormValue,
  CompanyVerification,
  Department,
  DepartmentFormValue,
  VerificationFormValue,
} from '@core/models/company.model';
import { VerificationStatus } from '@core/enums/verification-status.enum';
import { CompanyOverview } from '../models/company-overview.model';
import {
  MOCK_COMPANY,
  MOCK_COMPANY_COUNTS,
  MOCK_COMPANY_LOCATIONS,
  MOCK_COMPANY_VERIFICATION,
  MOCK_DEPARTMENTS,
  MOCK_PLAN,
  MOCK_PLAN_USAGE,
} from './mock/mock-company';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/employer/company';

/**
 * Company administration API. Stateful mock so profile/location edits persist
 * for the session. Later slices add departments + verification.
 */
@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = inject(ApiBaseService);

  private company: Company = clone(MOCK_COMPANY);
  private locations: CompanyLocation[] = clone(MOCK_COMPANY_LOCATIONS);
  private departments: Department[] = clone(MOCK_DEPARTMENTS);
  private verification: CompanyVerification = clone(MOCK_COMPANY_VERIFICATION);
  private nextLocationId = 100;
  private nextDepartmentId = 100;

  getProfile(): Observable<Company> {
    if (!environment.useMock) {
      return this.api.get<Company>(`${ENDPOINT}/profile`);
    }
    return of(clone(this.company)).pipe(delay(MOCK_LATENCY));
  }

  updateProfile(value: CompanyProfileFormValue): Observable<Company> {
    if (!environment.useMock) {
      return this.api.put<Company>(`${ENDPOINT}/profile`, value);
    }
    this.company = {
      ...this.company,
      name: value.name,
      website: value.website,
      industry: value.industry,
      companySize: value.companySize,
      description: value.description,
      updatedAt: new Date().toISOString(),
    };
    return of(clone(this.company)).pipe(delay(MOCK_LATENCY));
  }

  /** Uploads a logo and returns its URL. Mock reads the file to a data URL. */
  uploadLogo(file: File): Observable<{ logoUrl: string }> {
    if (!environment.useMock) {
      const form = new FormData();
      form.append('logo', file);
      return this.api.post<{ logoUrl: string }>(`${ENDPOINT}/logo`, form);
    }
    return new Observable<{ logoUrl: string }>((subscriber) => {
      const reader = new FileReader();
      reader.onload = () => {
        const logoUrl = String(reader.result);
        this.company = { ...this.company, logoUrl, updatedAt: new Date().toISOString() };
        subscriber.next({ logoUrl });
        subscriber.complete();
      };
      reader.onerror = () => subscriber.error({ status: 0, code: 'READ_ERROR', message: 'Could not read the file.' });
      reader.readAsDataURL(file);
    }).pipe(delay(MOCK_LATENCY));
  }

  /** Aggregated snapshot for the overview + context store. */
  getOverview(): Observable<CompanyOverview> {
    if (!environment.useMock) {
      return this.api.get<CompanyOverview>(`${ENDPOINT}/overview`);
    }
    const overview: CompanyOverview = {
      company: clone(this.company),
      verification: clone(this.verification),
      plan: clone(MOCK_PLAN),
      usage: clone(MOCK_PLAN_USAGE),
      counts: { ...MOCK_COMPANY_COUNTS, departments: this.departments.length, locations: this.locations.length },
    };
    return of(overview).pipe(delay(MOCK_LATENCY));
  }

  // --- Verification ---------------------------------------------------------

  getVerification(): Observable<CompanyVerification> {
    if (!environment.useMock) {
      return this.api.get<CompanyVerification>(`${ENDPOINT}/verification`);
    }
    return of(clone(this.verification)).pipe(delay(MOCK_LATENCY));
  }

  /** Submits (or resubmits, after rejection) for verification → Pending. */
  submitVerification(value: VerificationFormValue): Observable<CompanyVerification> {
    if (!environment.useMock) {
      return this.api.post<CompanyVerification>(`${ENDPOINT}/verification`, value);
    }
    const now = new Date().toISOString();
    this.verification = {
      ...this.verification,
      registrationNo: value.registrationNo,
      taxNo: value.taxNo,
      website: value.website,
      officialEmail: value.officialEmail,
      documents: value.documents.map((doc, index) => ({
        id: index + 1,
        label: doc.label,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        uploadedAt: now,
      })),
      status: VerificationStatus.Pending,
      submittedAt: now,
      reviewedAt: undefined,
      rejectionReason: undefined,
    };
    this.company = { ...this.company, verified: false };
    return of(clone(this.verification)).pipe(delay(MOCK_LATENCY));
  }

  // --- Departments ----------------------------------------------------------

  listDepartments(): Observable<Department[]> {
    if (!environment.useMock) {
      return this.api.get<Department[]>(`${ENDPOINT}/departments`);
    }
    const items = [...this.departments].sort((a, b) => a.name.localeCompare(b.name));
    return of(clone(items)).pipe(delay(MOCK_LATENCY));
  }

  saveDepartment(value: DepartmentFormValue, id?: Id): Observable<Department> {
    if (!environment.useMock) {
      return id
        ? this.api.put<Department>(`${ENDPOINT}/departments/${id}`, value)
        : this.api.post<Department>(`${ENDPOINT}/departments`, value);
    }
    let saved: Department;
    if (id) {
      const existing = this.departments.find((item) => item.id === id);
      if (!existing) {
        return throwError(() => departmentNotFound()).pipe(delay(MOCK_LATENCY));
      }
      saved = { ...existing, name: value.name, description: value.description };
      this.departments = this.departments.map((item) => (item.id === id ? saved : item));
    } else {
      saved = { id: this.nextDepartmentId++, name: value.name, description: value.description, jobCount: 0 };
      this.departments = [...this.departments, saved];
    }
    return of(clone(saved)).pipe(delay(MOCK_LATENCY));
  }

  removeDepartment(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${ENDPOINT}/departments/${id}`);
    }
    const department = this.departments.find((item) => item.id === id);
    if (department && department.jobCount > 0) {
      const error: ApiError = { status: 409, code: 'CONFLICT', message: 'Reassign this department\'s jobs before deleting it.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    this.departments = this.departments.filter((item) => item.id !== id);
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  // --- Locations ------------------------------------------------------------

  listLocations(): Observable<CompanyLocation[]> {
    if (!environment.useMock) {
      return this.api.get<CompanyLocation[]>(`${ENDPOINT}/locations`);
    }
    return of(clone(this.sortedLocations())).pipe(delay(MOCK_LATENCY));
  }

  saveLocation(value: CompanyLocationFormValue, id?: Id): Observable<CompanyLocation> {
    if (!environment.useMock) {
      return id
        ? this.api.put<CompanyLocation>(`${ENDPOINT}/locations/${id}`, value)
        : this.api.post<CompanyLocation>(`${ENDPOINT}/locations`, value);
    }
    let saved: CompanyLocation;
    if (id) {
      const existing = this.locations.find((item) => item.id === id);
      if (!existing) {
        return throwError(() => locationNotFound()).pipe(delay(MOCK_LATENCY));
      }
      saved = { ...existing, ...value, id };
      this.locations = this.locations.map((item) => (item.id === id ? saved : item));
    } else {
      saved = { ...value, id: this.nextLocationId++ };
      this.locations = [...this.locations, saved];
    }
    if (value.isHeadOffice) {
      this.makeHeadOffice(saved.id);
    } else {
      this.ensureHeadOffice();
    }
    return of(clone(this.locations.find((item) => item.id === saved.id)!)).pipe(delay(MOCK_LATENCY));
  }

  removeLocation(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${ENDPOINT}/locations/${id}`);
    }
    const removed = this.locations.find((item) => item.id === id);
    this.locations = this.locations.filter((item) => item.id !== id);
    if (removed?.isHeadOffice) {
      this.ensureHeadOffice();
    }
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  /** Marks one location as the head office (clears the others). */
  setHeadOffice(id: Id): Observable<CompanyLocation[]> {
    if (!environment.useMock) {
      return this.api.post<CompanyLocation[]>(`${ENDPOINT}/locations/${id}/head-office`, {});
    }
    this.makeHeadOffice(id);
    return of(clone(this.sortedLocations())).pipe(delay(MOCK_LATENCY));
  }

  private makeHeadOffice(id: Id): void {
    this.locations = this.locations.map((item) => ({ ...item, isHeadOffice: item.id === id }));
  }

  /** Guarantees exactly one head office whenever at least one location exists. */
  private ensureHeadOffice(): void {
    if (!this.locations.length || this.locations.some((item) => item.isHeadOffice)) {
      return;
    }
    this.locations = this.locations.map((item, index) => ({ ...item, isHeadOffice: index === 0 }));
  }

  private sortedLocations(): CompanyLocation[] {
    return [...this.locations].sort((a, b) => Number(b.isHeadOffice) - Number(a.isHeadOffice));
  }
}

function locationNotFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'Location not found.' };
}

function departmentNotFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'Department not found.' };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
