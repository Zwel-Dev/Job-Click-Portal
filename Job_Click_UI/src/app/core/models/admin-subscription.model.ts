import { Id } from './common.model';
import { SubscriptionStatus } from '@core/enums/subscription-status.enum';
import { PaymentStatus } from '@core/enums/payment-status.enum';

/** A company's subscription as seen by the platform admin (SUBSCRIPTIONS + plan + company). */
export interface AdminSubscription {
  id: Id;
  companyId: Id;
  companyName: string;
  companyCode: string;
  planName: string;
  /** Monthly price in `currency`. */
  price: number;
  currency: string;
  status: SubscriptionStatus;
  startDate: string;
  /** Renewal / expiry date. */
  endDate?: string;
}

/** A single payment / invoice line (mirrors PAYMENTS in the ERD). */
export interface Payment {
  id: Id;
  companyId: Id;
  companyName: string;
  invoiceNo: string;
  planName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** Display label for the method, e.g. "Visa •••• 4242". */
  method: string;
  paidAt: string;
}

/** Headline billing metrics for the oversight KPI strip. */
export interface BillingSummary {
  mrr: number;
  currency: string;
  activeSubscriptions: number;
  pastDue: number;
  paidCompanies: number;
}

/** Query for the admin subscription list (search + filters + pagination). */
export interface AdminSubscriptionQuery {
  keyword?: string;
  planName?: string;
  status?: SubscriptionStatus;
  page: number;
  pageSize: number;
}
