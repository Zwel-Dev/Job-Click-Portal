/** One bucket in a monthly trend series. */
export interface GrowthPoint {
  label: string;
  value: number;
}

/** One stage of the platform-wide hiring funnel (counts decrease down). */
export interface FunnelStep {
  label: string;
  value: number;
}

/** Company count on a subscription plan. */
export interface PlanShare {
  label: string;
  value: number;
}

/** Period totals for the analytics KPI strip. */
export interface SystemAnalyticsKpis {
  newUsers: number;
  newCompanies: number;
  jobsPosted: number;
  applications: number;
}

/** Aggregated platform analytics (PA2.2 §8.6). */
export interface SystemAnalytics {
  periodLabel: string;
  kpis: SystemAnalyticsKpis;
  userGrowth: GrowthPoint[];
  companyGrowth: GrowthPoint[];
  jobsPosted: GrowthPoint[];
  applications: GrowthPoint[];
  funnel: FunnelStep[];
  planDistribution: PlanShare[];
}
