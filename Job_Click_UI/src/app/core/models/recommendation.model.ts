import { Id } from './common.model';
import { JobSummary } from './job.model';

/** Weighted match score breakdown (Project_Doc §9). */
export interface JobMatchScore {
  jobId: Id;
  total: number;
  skill: number;
  experience: number;
  location: number;
  salary: number;
  education: number;
  calculatedAt: string;
}

export interface RecommendedJob {
  job: JobSummary;
  match: JobMatchScore;
}

export type MatchCategory = 'best' | 'good' | 'growth' | 'trending' | 'new';
