import { ApplicationStatus, StatusTone } from '@core/enums/application-status.enum';
import { ApplicantSummary } from '@core/models/applicant.model';

/** Headline metrics for the recruiter dashboard KPI strip. */
export interface EmployerKpis {
  activeJobs: number;
  totalApplicants: number;
  inInterview: number;
  offersOut: number;
}

/** Applicant count for one pipeline stage (dashboard snapshot widget). */
export interface PipelineStageCount {
  status: ApplicationStatus;
  label: string;
  tone: StatusTone;
  count: number;
}

/** Aggregated payload for the recruiter dashboard. */
export interface EmployerDashboardData {
  kpis: EmployerKpis;
  pipeline: PipelineStageCount[];
  recentApplicants: ApplicantSummary[];
}
