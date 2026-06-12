import { JobMatchScore } from '@core/models/recommendation.model';

interface SubScores {
  skill: number;
  experience: number;
  location: number;
  salary: number;
  education: number;
}

/** Seeded match sub-scores per jobId. Total is the weighted score (Project_Doc §9). */
const SUB_SCORES: Record<number, SubScores> = {
  2: { skill: 98, experience: 90, location: 100, salary: 85, education: 88 }, // Angular Developer
  1: { skill: 95, experience: 88, location: 92, salary: 80, education: 85 }, // Senior Frontend
  5: { skill: 82, experience: 86, location: 92, salary: 90, education: 80 }, // DevOps
  3: { skill: 80, experience: 80, location: 72, salary: 82, education: 80 }, // Full Stack
  6: { skill: 74, experience: 78, location: 90, salary: 80, education: 76 }, // Backend (Node)
  4: { skill: 70, experience: 72, location: 92, salary: 76, education: 72 }, // UI/UX Designer
  11: { skill: 66, experience: 70, location: 86, salary: 72, education: 72 }, // Mobile (Flutter)
  10: { skill: 64, experience: 62, location: 88, salary: 66, education: 70 }, // QA Engineer
  9: { skill: 60, experience: 64, location: 80, salary: 72, education: 76 }, // Data Analyst
  7: { skill: 62, experience: 56, location: 88, salary: 52, education: 72 }, // Junior Web Dev
  8: { skill: 55, experience: 72, location: 86, salary: 92, education: 80 }, // Product Manager
  12: { skill: 60, experience: 42, location: 86, salary: 42, education: 66 }, // Frontend Intern
};

/** Curated "trending" jobs (most viewed/applied). */
export const TRENDING_JOB_IDS: readonly number[] = [8, 5, 1, 6, 4];

export const MATCH_SCORE_JOB_IDS: readonly number[] = Object.keys(SUB_SCORES).map(Number);

function weightedTotal(scores: SubScores): number {
  return Math.round(
    (scores.skill * 40 +
      scores.experience * 25 +
      scores.location * 15 +
      scores.salary * 10 +
      scores.education * 10) /
      100,
  );
}

export function buildMatchScore(jobId: number): JobMatchScore | undefined {
  const scores = SUB_SCORES[jobId];
  if (!scores) {
    return undefined;
  }
  return {
    jobId,
    total: weightedTotal(scores),
    skill: scores.skill,
    experience: scores.experience,
    location: scores.location,
    salary: scores.salary,
    education: scores.education,
    calculatedAt: '2026-06-09T00:00:00Z',
  };
}
