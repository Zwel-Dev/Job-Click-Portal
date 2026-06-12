import { Company, CompanyVerification } from '@core/models/company.model';
import { PlanUsage, SubscriptionPlan } from '@core/models/subscription.model';

/** Counts surfaced on the company-admin overview. */
export interface CompanyCounts {
  members: number;
  departments: number;
  locations: number;
}

/** Aggregated snapshot for the company-admin area (overview + context store). */
export interface CompanyOverview {
  company: Company;
  verification: CompanyVerification;
  plan: SubscriptionPlan;
  usage: PlanUsage;
  counts: CompanyCounts;
}
