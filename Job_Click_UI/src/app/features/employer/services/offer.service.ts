import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { ApiError, Id } from '@core/models/common.model';
import { ApplicationStatus } from '@core/enums/application-status.enum';
import { OfferStatus } from '@core/enums/offer-status.enum';
import { Offer, OfferFormValue } from '@core/models/offer.model';
import { ApplicantService } from './applicant.service';
import { MOCK_OFFERS } from './mock/mock-offers';

const MOCK_LATENCY = 400;
const ENDPOINT = '/api/v1/employer/offers';

/** Identifies the applicant an offer is being created for. */
export interface OfferDraftMeta {
  applicationId: Id;
  candidateName: string;
  jobTitle: string;
}

/**
 * Offer management. Stateful mock; creating an offer also moves the application
 * into the Offer stage via the shared ApplicantService (Project_Doc §7).
 */
@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly api = inject(ApiBaseService);
  private readonly applicantService = inject(ApplicantService);

  private offers: Offer[] = clone(MOCK_OFFERS);
  private nextId = 720;

  list(status?: OfferStatus): Observable<Offer[]> {
    if (!environment.useMock) {
      return this.api.get<Offer[]>(ENDPOINT, { status });
    }
    let items = [...this.offers];
    if (status) {
      items = items.filter((offer) => offer.status === status);
    }
    items.sort((a, b) => b.offeredAt.localeCompare(a.offeredAt));
    return of(clone(items)).pipe(delay(MOCK_LATENCY));
  }

  /** The latest offer for an application, or null when none exists yet. */
  getByApplication(applicationId: Id): Observable<Offer | null> {
    if (!environment.useMock) {
      return this.api.get<Offer | null>(`${ENDPOINT}/by-application/${applicationId}`);
    }
    const offer = this.offers
      .filter((item) => item.applicationId === applicationId)
      .sort((a, b) => b.offeredAt.localeCompare(a.offeredAt))[0];
    return of(offer ? clone(offer) : null).pipe(delay(MOCK_LATENCY));
  }

  create(meta: OfferDraftMeta, value: OfferFormValue): Observable<Offer> {
    if (!environment.useMock) {
      return this.api.post<Offer>(ENDPOINT, { applicationId: meta.applicationId, ...value });
    }
    const offer: Offer = {
      id: this.nextId++,
      applicationId: meta.applicationId,
      candidateName: meta.candidateName,
      jobTitle: meta.jobTitle,
      offeredSalary: value.offeredSalary,
      currency: value.currency,
      joiningDate: value.joiningDate,
      status: OfferStatus.Draft,
      offeredAt: new Date().toISOString(),
    };
    this.offers = [offer, ...this.offers];
    // Advance the candidate to the Offer stage in the shared pipeline store.
    return this.applicantService
      .moveStage(meta.applicationId, ApplicationStatus.Offer)
      .pipe(map(() => clone(offer)));
  }

  updateStatus(id: Id, status: OfferStatus): Observable<Offer> {
    if (!environment.useMock) {
      return this.api.post<Offer>(`${ENDPOINT}/${id}/status`, { status });
    }
    const offer = this.offers.find((item) => item.id === id);
    if (!offer) {
      const error: ApiError = { status: 404, code: 'NOT_FOUND', message: 'Offer not found.' };
      return throwError(() => error).pipe(delay(MOCK_LATENCY));
    }
    offer.status = status;
    return of(clone(offer)).pipe(delay(MOCK_LATENCY));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
