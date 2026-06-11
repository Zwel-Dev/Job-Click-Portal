import { Id } from './common.model';
import { ApplicationStatus } from '@core/enums/application-status.enum';
import { JobSummary } from './job.model';

export interface ApplicationStatusEvent {
  status: ApplicationStatus;
  changedAt: string;
  remarks?: string;
}

export interface Application {
  id: Id;
  job: JobSummary;
  resumeId: Id;
  status: ApplicationStatus;
  matchScore?: number;
  appliedAt: string;
  statusHistory: ApplicationStatusEvent[];
}

export interface ApplyRequest {
  jobId: Id;
  resumeId: Id;
  coverNote?: string;
}
