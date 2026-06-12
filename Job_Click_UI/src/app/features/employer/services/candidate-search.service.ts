import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { Paginated } from '@core/models/common.model';
import { WorkMode } from '@core/enums/work-mode.enum';
import { ProfileVisibility } from '@core/enums/profile-visibility.enum';
import { CandidateSearchQuery, CandidateSearchResult, CandidateSortOption } from '../models/candidate-search.model';
import { MOCK_TALENT_POOL } from './mock/mock-candidate-search';

const MOCK_LATENCY = 450;
const ENDPOINT = '/api/v1/employer/candidates';

/**
 * Employer talent search. Visibility-aware: Private profiles are never returned
 * to recruiters (enforced here for the mock; the API enforces it server-side).
 */
@Injectable({ providedIn: 'root' })
export class CandidateSearchService {
  private readonly api = inject(ApiBaseService);

  search(query: CandidateSearchQuery): Observable<Paginated<CandidateSearchResult>> {
    if (!environment.useMock) {
      const params: Record<string, string | number | boolean> = {
        sort: query.sort,
        page: query.page,
        pageSize: query.pageSize,
      };
      if (query.keyword) params['keyword'] = query.keyword;
      if (query.location) params['location'] = query.location;
      if (query.seniorityLevels?.length) params['seniority'] = query.seniorityLevels.join(',');
      if (query.availability?.length) params['availability'] = query.availability.join(',');
      if (query.remoteOnly) params['remote'] = true;
      return this.api.getPaginated<CandidateSearchResult>(ENDPOINT, params);
    }

    const discoverable = MOCK_TALENT_POOL.filter((c) => c.visibility !== ProfileVisibility.Private);
    const filtered = sortCandidates(discoverable.filter((c) => matches(c, query)), query.sort);

    const totalItems = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const result: Paginated<CandidateSearchResult> = {
      data: clone(filtered.slice(start, start + query.pageSize)),
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
    };
    return of(result).pipe(delay(MOCK_LATENCY));
  }
}

function matches(candidate: CandidateSearchResult, query: CandidateSearchQuery): boolean {
  if (query.keyword) {
    const keyword = query.keyword.toLowerCase();
    const haystack = `${candidate.fullName} ${candidate.headline ?? ''} ${candidate.topSkills.join(' ')}`.toLowerCase();
    if (!haystack.includes(keyword)) {
      return false;
    }
  }
  if (query.location && !(candidate.location ?? '').toLowerCase().includes(query.location.toLowerCase())) {
    return false;
  }
  if (query.seniorityLevels?.length && !query.seniorityLevels.includes(candidate.seniorityLevel)) {
    return false;
  }
  if (query.availability?.length && !query.availability.includes(candidate.availabilityStatus)) {
    return false;
  }
  if (query.remoteOnly && candidate.workMode !== WorkMode.Remote) {
    return false;
  }
  return true;
}

function sortCandidates(candidates: CandidateSearchResult[], sort: CandidateSortOption): CandidateSearchResult[] {
  const sorted = [...candidates];
  switch (sort) {
    case 'experience':
      return sorted.sort((a, b) => b.yearsExperience - a.yearsExperience);
    case 'name':
      return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
    case 'recent':
    default:
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
