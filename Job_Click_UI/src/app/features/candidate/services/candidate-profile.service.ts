import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { ApiError, Id } from '@core/models/common.model';
import {
  CandidateCertification,
  CandidateEducation,
  CandidateExperience,
  CandidatePortfolio,
  CandidateProfile,
  CandidateSkill,
} from '@core/models/candidate.model';
import {
  MOCK_CANDIDATE_PROFILE,
  MOCK_CERTIFICATIONS,
  MOCK_EDUCATIONS,
  MOCK_EXPERIENCES,
  MOCK_PORTFOLIOS,
  MOCK_SKILLS,
} from './mock/mock-candidate';

const MOCK_LATENCY = 450;

/**
 * Candidate profile API + sub-collection CRUD. Mock branch keeps everything in
 * memory so edits persist within the session. Flip `environment.useMock` to
 * switch to the real backend with no component changes.
 */
@Injectable({ providedIn: 'root' })
export class CandidateProfileService {
  private readonly api = inject(ApiBaseService);

  private mockProfile: CandidateProfile = clone(MOCK_CANDIDATE_PROFILE);
  private readonly skills = new MockCollection<CandidateSkill>(MOCK_SKILLS);
  private readonly experiences = new MockCollection<CandidateExperience>(MOCK_EXPERIENCES);
  private readonly educations = new MockCollection<CandidateEducation>(MOCK_EDUCATIONS);
  private readonly certifications = new MockCollection<CandidateCertification>(MOCK_CERTIFICATIONS);
  private readonly portfolios = new MockCollection<CandidatePortfolio>(MOCK_PORTFOLIOS);

  // --- Profile --------------------------------------------------------------
  getProfile(): Observable<CandidateProfile> {
    return environment.useMock
      ? of(clone(this.mockProfile)).pipe(delay(MOCK_LATENCY))
      : this.api.get<CandidateProfile>(API.candidate.profile);
  }

  updateProfile(patch: Partial<CandidateProfile>): Observable<CandidateProfile> {
    if (!environment.useMock) {
      return this.api.put<CandidateProfile>(API.candidate.profile, patch);
    }
    this.mockProfile = { ...this.mockProfile, ...patch };
    return of(clone(this.mockProfile)).pipe(delay(MOCK_LATENCY));
  }

  // --- Skills ---------------------------------------------------------------
  getSkills(): Observable<CandidateSkill[]> {
    return environment.useMock ? this.skills.list() : this.api.get<CandidateSkill[]>(API.candidate.skills);
  }
  addSkill(input: Omit<CandidateSkill, 'id'>): Observable<CandidateSkill> {
    return environment.useMock ? this.skills.add(input) : this.api.post<CandidateSkill>(API.candidate.skills, input);
  }
  updateSkill(id: Id, input: Omit<CandidateSkill, 'id'>): Observable<CandidateSkill> {
    return environment.useMock ? this.skills.update(id, input) : this.api.put<CandidateSkill>(`${API.candidate.skills}/${id}`, input);
  }
  removeSkill(id: Id): Observable<void> {
    return environment.useMock ? this.skills.remove(id) : this.api.delete<void>(`${API.candidate.skills}/${id}`);
  }

  // --- Experiences ----------------------------------------------------------
  getExperiences(): Observable<CandidateExperience[]> {
    return environment.useMock ? this.experiences.list() : this.api.get<CandidateExperience[]>(API.candidate.experiences);
  }
  addExperience(input: Omit<CandidateExperience, 'id'>): Observable<CandidateExperience> {
    return environment.useMock ? this.experiences.add(input) : this.api.post<CandidateExperience>(API.candidate.experiences, input);
  }
  updateExperience(id: Id, input: Omit<CandidateExperience, 'id'>): Observable<CandidateExperience> {
    return environment.useMock ? this.experiences.update(id, input) : this.api.put<CandidateExperience>(`${API.candidate.experiences}/${id}`, input);
  }
  removeExperience(id: Id): Observable<void> {
    return environment.useMock ? this.experiences.remove(id) : this.api.delete<void>(`${API.candidate.experiences}/${id}`);
  }

  // --- Educations -----------------------------------------------------------
  getEducations(): Observable<CandidateEducation[]> {
    return environment.useMock ? this.educations.list() : this.api.get<CandidateEducation[]>(API.candidate.educations);
  }
  addEducation(input: Omit<CandidateEducation, 'id'>): Observable<CandidateEducation> {
    return environment.useMock ? this.educations.add(input) : this.api.post<CandidateEducation>(API.candidate.educations, input);
  }
  updateEducation(id: Id, input: Omit<CandidateEducation, 'id'>): Observable<CandidateEducation> {
    return environment.useMock ? this.educations.update(id, input) : this.api.put<CandidateEducation>(`${API.candidate.educations}/${id}`, input);
  }
  removeEducation(id: Id): Observable<void> {
    return environment.useMock ? this.educations.remove(id) : this.api.delete<void>(`${API.candidate.educations}/${id}`);
  }

  // --- Certifications -------------------------------------------------------
  getCertifications(): Observable<CandidateCertification[]> {
    return environment.useMock ? this.certifications.list() : this.api.get<CandidateCertification[]>(API.candidate.certifications);
  }
  addCertification(input: Omit<CandidateCertification, 'id'>): Observable<CandidateCertification> {
    return environment.useMock ? this.certifications.add(input) : this.api.post<CandidateCertification>(API.candidate.certifications, input);
  }
  updateCertification(id: Id, input: Omit<CandidateCertification, 'id'>): Observable<CandidateCertification> {
    return environment.useMock ? this.certifications.update(id, input) : this.api.put<CandidateCertification>(`${API.candidate.certifications}/${id}`, input);
  }
  removeCertification(id: Id): Observable<void> {
    return environment.useMock ? this.certifications.remove(id) : this.api.delete<void>(`${API.candidate.certifications}/${id}`);
  }

  // --- Portfolios -----------------------------------------------------------
  getPortfolios(): Observable<CandidatePortfolio[]> {
    return environment.useMock ? this.portfolios.list() : this.api.get<CandidatePortfolio[]>(API.candidate.portfolios);
  }
  addPortfolio(input: Omit<CandidatePortfolio, 'id'>): Observable<CandidatePortfolio> {
    return environment.useMock ? this.portfolios.add(input) : this.api.post<CandidatePortfolio>(API.candidate.portfolios, input);
  }
  updatePortfolio(id: Id, input: Omit<CandidatePortfolio, 'id'>): Observable<CandidatePortfolio> {
    return environment.useMock ? this.portfolios.update(id, input) : this.api.put<CandidatePortfolio>(`${API.candidate.portfolios}/${id}`, input);
  }
  removePortfolio(id: Id): Observable<void> {
    return environment.useMock ? this.portfolios.remove(id) : this.api.delete<void>(`${API.candidate.portfolios}/${id}`);
  }
}

// --- Mock helpers -----------------------------------------------------------

let mockIdSeq = 5000;
function nextMockId(): Id {
  return mockIdSeq++;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function notFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'Item not found.' };
}

/** In-memory CRUD collection with realistic latency, for the mock backend. */
class MockCollection<T extends { id: Id }> {
  private items: T[];

  constructor(seed: readonly T[]) {
    this.items = clone(seed as T[]);
  }

  list(): Observable<T[]> {
    return of(clone(this.items)).pipe(delay(MOCK_LATENCY));
  }

  add(input: Omit<T, 'id'>): Observable<T> {
    const item = Object.assign({}, input, { id: nextMockId() }) as unknown as T;
    this.items = [...this.items, item];
    return of(clone(item)).pipe(delay(MOCK_LATENCY));
  }

  update(id: Id, input: Omit<T, 'id'>): Observable<T> {
    const existing = this.items.find((it) => it.id === id);
    if (!existing) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    const updated = Object.assign({}, existing, input, { id }) as unknown as T;
    this.items = this.items.map((it) => (it.id === id ? updated : it));
    return of(clone(updated)).pipe(delay(MOCK_LATENCY));
  }

  remove(id: Id): Observable<void> {
    this.items = this.items.filter((it) => it.id !== id);
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }
}
