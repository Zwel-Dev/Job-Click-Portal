import { SystemAnalytics } from '@core/models/system-analytics.model';

/** Platform-wide analytics over the last six months. Plan distribution matches MOCK_ADMIN_SUBSCRIPTIONS. */
export const MOCK_SYSTEM_ANALYTICS: SystemAnalytics = {
  periodLabel: 'Last 6 months',
  kpis: {
    newUsers: 1055,
    newCompanies: 11,
    jobsPosted: 76,
    applications: 2930,
  },
  userGrowth: [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 145 },
    { label: 'Mar', value: 160 },
    { label: 'Apr', value: 180 },
    { label: 'May', value: 210 },
    { label: 'Jun', value: 240 },
  ],
  companyGrowth: [
    { label: 'Jan', value: 1 },
    { label: 'Feb', value: 2 },
    { label: 'Mar', value: 1 },
    { label: 'Apr', value: 2 },
    { label: 'May', value: 3 },
    { label: 'Jun', value: 2 },
  ],
  jobsPosted: [
    { label: 'Jan', value: 8 },
    { label: 'Feb', value: 11 },
    { label: 'Mar', value: 9 },
    { label: 'Apr', value: 14 },
    { label: 'May', value: 18 },
    { label: 'Jun', value: 16 },
  ],
  applications: [
    { label: 'Jan', value: 320 },
    { label: 'Feb', value: 410 },
    { label: 'Mar', value: 380 },
    { label: 'Apr', value: 520 },
    { label: 'May', value: 610 },
    { label: 'Jun', value: 690 },
  ],
  funnel: [
    { label: 'Applied', value: 4200 },
    { label: 'Viewed', value: 3100 },
    { label: 'Shortlisted', value: 950 },
    { label: 'Interview', value: 520 },
    { label: 'Offer', value: 180 },
    { label: 'Hired', value: 120 },
  ],
  planDistribution: [
    { label: 'Free', value: 2 },
    { label: 'Pro', value: 4 },
    { label: 'Enterprise', value: 1 },
  ],
};
