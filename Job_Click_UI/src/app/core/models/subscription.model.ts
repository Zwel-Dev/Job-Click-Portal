import { Id } from './common.model';
import { SubscriptionStatus } from '@core/enums/subscription-status.enum';

/** A subscription plan (mirrors SUBSCRIPTION_PLANS in the ERD). */
export interface SubscriptionPlan {
  id: Id;
  name: string;
  price: number;
  currency: string;
  maxJobs: number;
  maxRecruiters: number;
  candidateSearch: boolean;
  features: string[];
}

/** A company's subscription (mirrors SUBSCRIPTIONS in the ERD). */
export interface Subscription {
  id: Id;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
}

export interface PlanUsage {
  jobsUsed: number;
  jobsLimit: number;
  recruitersUsed: number;
  recruitersLimit: number;
}
