import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { Id } from '@core/models/common.model';
import { JobMatchScore, MatchCategory, RecommendedJob } from '@core/models/recommendation.model';
import { findMockJob } from './mock/mock-jobs';
import { MATCH_SCORE_JOB_IDS, TRENDING_JOB_IDS, buildMatchScore } from './mock/mock-recommendations';
import { SavedJobService } from './saved-job.service';

const MOCK_LATENCY = 500;

/**
 * Job recommendations + match-score breakdowns. Scoring is server-side in
 * production (Project_Doc §9); the frontend requests, displays, and explains.
 */
@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly api = inject(ApiBaseService);
  private readonly savedJobService = inject(SavedJobService);

  getRecommendedJobs(category: MatchCategory): Observable<RecommendedJob[]> {
    if (!environment.useMock) {
      return this.api.get<RecommendedJob[]>(API.candidate.recommendations, { category });
    }
    const all = this.buildAll();
    let list: RecommendedJob[] = [];
    switch (category) {
      case 'best':
        list = all.filter((rec) => rec.match.total >= 90).sort(byTotalDesc);
        break;
      case 'good':
        list = all.filter((rec) => rec.match.total >= 75 && rec.match.total < 90).sort(byTotalDesc);
        break;
      case 'growth':
        list = all.filter((rec) => rec.match.total >= 60 && rec.match.total < 75).sort(byTotalDesc);
        break;
      case 'trending':
        list = TRENDING_JOB_IDS.map((id) => all.find((rec) => rec.job.id === id)).filter(
          (rec): rec is RecommendedJob => Boolean(rec),
        );
        break;
      case 'new':
        list = [...all]
          .sort((a, b) => b.job.publishedAt.localeCompare(a.job.publishedAt))
          .slice(0, 6);
        break;
    }
    return of(clone(list)).pipe(delay(MOCK_LATENCY));
  }

  getTopRecommendations(limit = 5): Observable<RecommendedJob[]> {
    if (!environment.useMock) {
      return this.api.get<RecommendedJob[]>(API.candidate.recommendations, { sort: '-score', pageSize: limit });
    }
    const top = this.buildAll().sort(byTotalDesc).slice(0, limit);
    return of(clone(top)).pipe(delay(MOCK_LATENCY));
  }

  getMatchBreakdown(jobId: Id): Observable<JobMatchScore | null> {
    if (!environment.useMock) {
      return this.api.get<JobMatchScore>(`${API.candidate.recommendations}/${jobId}`);
    }
    return of(buildMatchScore(Number(jobId)) ?? null).pipe(delay(MOCK_LATENCY));
  }

  private buildAll(): RecommendedJob[] {
    const result: RecommendedJob[] = [];
    for (const id of MATCH_SCORE_JOB_IDS) {
      const job = findMockJob(id);
      const match = buildMatchScore(id);
      if (job && match) {
        result.push({
          job: { ...job, matchScore: match.total, isSaved: this.savedJobService.isSaved(job.id) },
          match,
        });
      }
    }
    return result;
  }
}

function byTotalDesc(a: RecommendedJob, b: RecommendedJob): number {
  return b.match.total - a.match.total;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
