import { Subscription, SubscriptionPlan } from '@core/models/subscription.model';
import { SubscriptionStatus } from '@core/enums/subscription-status.enum';

/** Plan catalog. `maxJobs`/`maxRecruiters` of 999 render as "Unlimited". */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 1, name: 'Free', price: 0, currency: 'USD',
    maxJobs: 3, maxRecruiters: 1, candidateSearch: false,
    features: ['Up to 3 active jobs', '1 recruiter', 'Applicant pipeline', 'Email support'],
  },
  {
    id: 2, name: 'Pro', price: 199, currency: 'USD',
    maxJobs: 20, maxRecruiters: 5, candidateSearch: true,
    features: ['Up to 20 active jobs', 'Up to 5 recruiters', 'Candidate search & talent pools', 'Recruitment analytics'],
  },
  {
    id: 3, name: 'Enterprise', price: 499, currency: 'USD',
    maxJobs: 999, maxRecruiters: 999, candidateSearch: true,
    features: ['Unlimited jobs', 'Unlimited recruiters', 'Advanced analytics', 'SSO & audit log', 'Priority support'],
  },
];

/** Greenline's current subscription — the Pro plan. */
export const MOCK_SUBSCRIPTION: Subscription = {
  id: 1,
  plan: SUBSCRIPTION_PLANS[1],
  status: SubscriptionStatus.Active,
  startDate: '2025-07-01T00:00:00Z',
  endDate: '2026-07-01T00:00:00Z',
};
