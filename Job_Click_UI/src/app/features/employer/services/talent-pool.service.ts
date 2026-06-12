import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { ApiError, Id } from '@core/models/common.model';
import {
  TalentPool,
  TalentPoolDetail,
  TalentPoolFormValue,
  TalentPoolMember,
} from '../models/talent-pool.model';
import { CandidateSearchResult } from '../models/candidate-search.model';
import { MOCK_TALENT_POOL } from './mock/mock-candidate-search';
import { MOCK_TALENT_POOLS, MockTalentPool } from './mock/mock-talent-pools';

const MOCK_LATENCY = 400;
const ENDPOINT = '/api/v1/employer/talent-pools';

/** Candidate directory, keyed by id — the source for resolving pool members. */
const DIRECTORY = new Map<Id, CandidateSearchResult>(
  MOCK_TALENT_POOL.map((candidate) => [candidate.candidateId, candidate]),
);

/** Named talent collections. Stateful mock so pools/membership persist this session. */
@Injectable({ providedIn: 'root' })
export class TalentPoolService {
  private readonly api = inject(ApiBaseService);

  private pools: MockTalentPool[] = clone(MOCK_TALENT_POOLS);
  private nextId = 510;

  list(): Observable<TalentPool[]> {
    if (!environment.useMock) {
      return this.api.get<TalentPool[]>(ENDPOINT);
    }
    const items = [...this.pools]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toSummary);
    return of(items).pipe(delay(MOCK_LATENCY));
  }

  getById(id: Id): Observable<TalentPoolDetail> {
    if (!environment.useMock) {
      return this.api.get<TalentPoolDetail>(`${ENDPOINT}/${id}`);
    }
    const pool = this.pools.find((item) => item.id === id);
    if (!pool) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    return of(toDetail(pool)).pipe(delay(MOCK_LATENCY));
  }

  create(value: TalentPoolFormValue): Observable<TalentPool> {
    if (!environment.useMock) {
      return this.api.post<TalentPool>(ENDPOINT, value);
    }
    const pool: MockTalentPool = {
      id: this.nextId++,
      name: value.name,
      description: value.description,
      createdAt: new Date().toISOString(),
      members: [],
    };
    this.pools = [pool, ...this.pools];
    return of(toSummary(pool)).pipe(delay(MOCK_LATENCY));
  }

  update(id: Id, value: TalentPoolFormValue): Observable<TalentPool> {
    if (!environment.useMock) {
      return this.api.put<TalentPool>(`${ENDPOINT}/${id}`, value);
    }
    const pool = this.pools.find((item) => item.id === id);
    if (!pool) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    pool.name = value.name;
    pool.description = value.description;
    return of(toSummary(pool)).pipe(delay(MOCK_LATENCY));
  }

  remove(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${ENDPOINT}/${id}`);
    }
    this.pools = this.pools.filter((item) => item.id !== id);
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  addCandidate(poolId: Id, candidateId: Id): Observable<TalentPool> {
    if (!environment.useMock) {
      return this.api.post<TalentPool>(`${ENDPOINT}/${poolId}/members`, { candidateId });
    }
    const pool = this.pools.find((item) => item.id === poolId);
    if (!pool) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    if (!pool.members.some((member) => member.candidateId === candidateId)) {
      pool.members = [...pool.members, { candidateId, addedAt: new Date().toISOString() }];
    }
    return of(toSummary(pool)).pipe(delay(MOCK_LATENCY));
  }

  removeCandidate(poolId: Id, candidateId: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${ENDPOINT}/${poolId}/members/${candidateId}`);
    }
    const pool = this.pools.find((item) => item.id === poolId);
    if (!pool) {
      return throwError(() => notFound()).pipe(delay(MOCK_LATENCY));
    }
    pool.members = pool.members.filter((member) => member.candidateId !== candidateId);
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }
}

function toSummary(pool: MockTalentPool): TalentPool {
  return {
    id: pool.id,
    name: pool.name,
    description: pool.description,
    candidateCount: pool.members.length,
    createdAt: pool.createdAt,
  };
}

function toDetail(pool: MockTalentPool): TalentPoolDetail {
  const members: TalentPoolMember[] = [];
  for (const member of pool.members) {
    const candidate = DIRECTORY.get(member.candidateId);
    if (!candidate) {
      continue;
    }
    members.push({
      candidateId: candidate.candidateId,
      fullName: candidate.fullName,
      headline: candidate.headline,
      location: candidate.location,
      topSkills: candidate.topSkills,
      seniorityLevel: candidate.seniorityLevel,
      availabilityStatus: candidate.availabilityStatus,
      addedAt: member.addedAt,
    });
  }
  members.sort((a, b) => b.addedAt.localeCompare(a.addedAt));

  return { ...toSummary(pool), members: clone(members) };
}

function notFound(): ApiError {
  return { status: 404, code: 'NOT_FOUND', message: 'Talent pool not found.' };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
