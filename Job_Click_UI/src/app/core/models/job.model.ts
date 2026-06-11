import { Id } from './common.model';
import { EmploymentType } from '@core/enums/employment-type.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { SeniorityLevel } from '@core/enums/seniority-level.enum';
import { JobStatus } from '@core/enums/job-status.enum';

/** Lightweight job for list/card surfaces. */
export interface JobSummary {
  id: Id;
  title: string;
  companyId: Id;
  companyName: string;
  companyLogoUrl?: string;
  industry?: string;
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  seniorityLevel: SeniorityLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  publishedAt: string;
  /** 0-100 match score for the current candidate (Phase 2). */
  matchScore?: number;
  isSaved?: boolean;
}

export interface JobSkillRequirement {
  skillId: Id;
  name: string;
  required: boolean;
}

export interface JobLocation {
  country: string;
  state?: string;
  city: string;
  address?: string;
}

/** Full job for the detail view. */
export interface Job extends JobSummary {
  description: string;
  requirements: string;
  skills: JobSkillRequirement[];
  benefits: string[];
  locations: JobLocation[];
  status: JobStatus;
  expiredAt?: string;
}

export interface SavedJob {
  id: Id;
  job: JobSummary;
  savedAt: string;
}
