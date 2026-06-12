import { Id } from './common.model';
import { ApplicationStatus } from '@core/enums/application-status.enum';
import { ProficiencyLevel } from '@core/enums/proficiency-level.enum';
import { CandidateEducation, CandidateExperience } from './candidate.model';
import { ApplicationStatusEvent } from './application.model';
import { JobMatchScore } from './recommendation.model';
import { ScreeningAnswer } from './screening.model';

/** Employer-facing view of an application (a candidate in a job's pipeline). */
export interface ApplicantSummary {
  applicationId: Id;
  candidateId: Id;
  jobId: Id;
  jobTitle: string;
  fullName: string;
  headline?: string;
  avatarUrl?: string;
  status: ApplicationStatus;
  matchScore?: number;
  appliedAt: string;
  resumeId: Id;
  tags: string[];
}

export interface CandidateNote {
  id: Id;
  author: string;
  body: string;
  createdAt: string;
}

export interface ApplicantSkill {
  name: string;
  proficiency: ProficiencyLevel;
}

export interface ApplicantDetail extends ApplicantSummary {
  email: string;
  phone?: string;
  location?: string;
  /** What the candidate submitted with this application. */
  coverNote?: string;
  resumeName?: string;
  resumeUrl?: string;
  screeningAnswers?: ScreeningAnswer[];
  skills: ApplicantSkill[];
  experiences: CandidateExperience[];
  educations: CandidateEducation[];
  notes: CandidateNote[];
  statusHistory: ApplicationStatusEvent[];
  match?: JobMatchScore;
}
