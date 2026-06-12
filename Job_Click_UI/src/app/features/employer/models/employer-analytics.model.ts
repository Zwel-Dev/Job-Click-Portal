/** Headline recruitment metrics for the analytics KPI strip. */
export interface AnalyticsKpis {
  openJobs: number;
  totalApplicants: number;
  hires: number;
  avgTimeToHireDays: number;
  /** Percentage of sent offers that were accepted (0-100). */
  offerAcceptanceRate: number;
}

/** One stage of the hiring funnel (counts decrease down the funnel). */
export interface FunnelStage {
  label: string;
  count: number;
}

/** Applicant volume for a single job. */
export interface JobApplicantStat {
  jobTitle: string;
  applicants: number;
}

/** Per-recruiter output over the period. */
export interface RecruiterPerformance {
  name: string;
  jobsPosted: number;
  hires: number;
}

/** Aggregated recruitment analytics for the company over a period. */
export interface RecruitmentAnalytics {
  periodLabel: string;
  kpis: AnalyticsKpis;
  funnel: FunnelStage[];
  applicationsByJob: JobApplicantStat[];
  recruiterPerformance: RecruiterPerformance[];
}
