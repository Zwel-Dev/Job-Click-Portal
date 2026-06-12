import { Id } from './common.model';
import { ApplicationStatus } from '@core/enums/application-status.enum';
import { JobSummary } from './job.model';
import { ScreeningAnswer } from './screening.model';

export interface ApplicationStatusEvent {
  status: ApplicationStatus;
  changedAt: string;
  remarks?: string;
}

export interface Application {
  id: Id;
  job: JobSummary;
  resumeId: Id;
  /** Cover note the candidate submitted with the application. */
  coverNote?: string;
  /** Answers to the job's screening questions, if any. */
  screeningAnswers?: ScreeningAnswer[];
  status: ApplicationStatus;
  matchScore?: number;
  appliedAt: string;
  statusHistory: ApplicationStatusEvent[];
}

export interface ApplyRequest {
  jobId: Id;
  resumeId: Id;
  coverNote?: string;
  answers?: ScreeningAnswer[];
}
