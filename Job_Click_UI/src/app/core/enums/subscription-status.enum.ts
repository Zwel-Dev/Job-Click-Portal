import { StatusTone } from './application-status.enum';

/** Subscription lifecycle (mirrors SUBSCRIPTIONS.status in the ERD). */
export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Trialing = 'TRIALING',
  PastDue = 'PAST_DUE',
  Expired = 'EXPIRED',
  Cancelled = 'CANCELLED',
}

export const SUBSCRIPTION_STATUS_META: Record<SubscriptionStatus, { label: string; tone: StatusTone }> = {
  [SubscriptionStatus.Active]: { label: 'Active', tone: 'success' },
  [SubscriptionStatus.Trialing]: { label: 'Trialing', tone: 'info' },
  [SubscriptionStatus.PastDue]: { label: 'Past due', tone: 'danger' },
  [SubscriptionStatus.Expired]: { label: 'Expired', tone: 'neutral' },
  [SubscriptionStatus.Cancelled]: { label: 'Cancelled', tone: 'neutral' },
};
