import { RecruitmentAnalytics } from '../../models/employer-analytics.model';

/**
 * Aggregated recruitment analytics for the demo company (Greenline Technologies)
 * over the last 90 days. Internally consistent: the funnel decreases to `hires`.
 */
export const MOCK_RECRUITMENT_ANALYTICS: RecruitmentAnalytics = {
  periodLabel: 'Last 90 days',
  kpis: {
    openJobs: 4,
    totalApplicants: 128,
    hires: 12,
    avgTimeToHireDays: 24,
    offerAcceptanceRate: 78,
  },
  funnel: [
    { label: 'Applied', count: 128 },
    { label: 'Screening', count: 86 },
    { label: 'Shortlisted', count: 52 },
    { label: 'Interview', count: 31 },
    { label: 'Offer', count: 16 },
    { label: 'Hired', count: 12 },
  ],
  applicationsByJob: [
    { jobTitle: 'Senior Frontend Developer', applicants: 34 },
    { jobTitle: 'Frontend Intern', applicants: 24 },
    { jobTitle: 'DevOps Engineer', applicants: 22 },
    { jobTitle: 'Backend Developer (Java)', applicants: 20 },
    { jobTitle: 'Data Engineer', applicants: 18 },
    { jobTitle: 'Product Designer', applicants: 10 },
  ],
  recruiterPerformance: [
    { name: 'Kyaw Zin Latt', jobsPosted: 6, hires: 7 },
    { name: 'Thiri Aung', jobsPosted: 4, hires: 5 },
  ],
};
