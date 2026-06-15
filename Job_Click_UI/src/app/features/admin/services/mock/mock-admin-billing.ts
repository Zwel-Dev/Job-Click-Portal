import { AdminSubscription, BillingSummary, Payment } from '@core/models/admin-subscription.model';
import { SubscriptionStatus } from '@core/enums/subscription-status.enum';
import { PaymentStatus } from '@core/enums/payment-status.enum';

const CURRENCY = 'USD';

/** One subscription per company (plans: Free $0 · Pro $199 · Enterprise $499). */
export const MOCK_ADMIN_SUBSCRIPTIONS: readonly AdminSubscription[] = [
  { id: 1, companyId: 10, companyName: 'Greenline Technologies', companyCode: 'GLT-0010', planName: 'Pro', price: 199, currency: CURRENCY, status: SubscriptionStatus.Active, startDate: '2025-07-01T00:00:00Z', endDate: '2026-07-01T00:00:00Z' },
  { id: 2, companyId: 11, companyName: 'BrightPath Solutions', companyCode: 'BPS-0011', planName: 'Pro', price: 199, currency: CURRENCY, status: SubscriptionStatus.Active, startDate: '2025-08-15T00:00:00Z', endDate: '2026-08-15T00:00:00Z' },
  { id: 3, companyId: 12, companyName: 'BlueWave Logistics', companyCode: 'BWL-0012', planName: 'Enterprise', price: 499, currency: CURRENCY, status: SubscriptionStatus.Active, startDate: '2025-03-01T00:00:00Z', endDate: '2026-09-01T00:00:00Z' },
  { id: 4, companyId: 13, companyName: 'Apex Finance Group', companyCode: 'AFG-0013', planName: 'Free', price: 0, currency: CURRENCY, status: SubscriptionStatus.Trialing, startDate: '2026-06-08T00:00:00Z', endDate: '2026-06-22T00:00:00Z' },
  { id: 5, companyId: 14, companyName: 'SwiftMart Retail', companyCode: 'SMR-0014', planName: 'Free', price: 0, currency: CURRENCY, status: SubscriptionStatus.Cancelled, startDate: '2026-03-01T00:00:00Z', endDate: '2026-05-30T00:00:00Z' },
  { id: 6, companyId: 15, companyName: 'Horizon Media House', companyCode: 'HMH-0015', planName: 'Pro', price: 199, currency: CURRENCY, status: SubscriptionStatus.PastDue, startDate: '2025-12-12T00:00:00Z', endDate: '2026-06-12T00:00:00Z' },
  { id: 7, companyId: 16, companyName: 'Quantum Health Labs', companyCode: 'QHL-0016', planName: 'Pro', price: 199, currency: CURRENCY, status: SubscriptionStatus.Active, startDate: '2026-06-04T00:00:00Z', endDate: '2026-07-04T00:00:00Z' },
];

/** Recent payments / invoices across companies. */
export const MOCK_PAYMENTS: readonly Payment[] = [
  { id: 1001, companyId: 10, companyName: 'Greenline Technologies', invoiceNo: 'INV-2026-0610', planName: 'Pro', amount: 199, currency: CURRENCY, status: PaymentStatus.Paid, method: 'Visa •••• 4242', paidAt: '2026-06-01T03:00:00Z' },
  { id: 1002, companyId: 10, companyName: 'Greenline Technologies', invoiceNo: 'INV-2026-0512', planName: 'Pro', amount: 199, currency: CURRENCY, status: PaymentStatus.Paid, method: 'Visa •••• 4242', paidAt: '2026-05-01T03:00:00Z' },
  { id: 1003, companyId: 11, companyName: 'BrightPath Solutions', invoiceNo: 'INV-2026-0608', planName: 'Pro', amount: 199, currency: CURRENCY, status: PaymentStatus.Paid, method: 'Mastercard •••• 8810', paidAt: '2026-06-02T05:30:00Z' },
  { id: 1004, companyId: 12, companyName: 'BlueWave Logistics', invoiceNo: 'INV-2026-0601', planName: 'Enterprise', amount: 499, currency: CURRENCY, status: PaymentStatus.Paid, method: 'Bank transfer', paidAt: '2026-06-01T09:00:00Z' },
  { id: 1005, companyId: 12, companyName: 'BlueWave Logistics', invoiceNo: 'INV-2026-0501', planName: 'Enterprise', amount: 499, currency: CURRENCY, status: PaymentStatus.Paid, method: 'Bank transfer', paidAt: '2026-05-01T09:00:00Z' },
  { id: 1006, companyId: 15, companyName: 'Horizon Media House', invoiceNo: 'INV-2026-0612', planName: 'Pro', amount: 199, currency: CURRENCY, status: PaymentStatus.Failed, method: 'Visa •••• 1005', paidAt: '2026-06-12T02:15:00Z' },
  { id: 1007, companyId: 15, companyName: 'Horizon Media House', invoiceNo: 'INV-2026-0512', planName: 'Pro', amount: 199, currency: CURRENCY, status: PaymentStatus.Paid, method: 'Visa •••• 1005', paidAt: '2026-05-12T02:15:00Z' },
  { id: 1008, companyId: 16, companyName: 'Quantum Health Labs', invoiceNo: 'INV-2026-0604', planName: 'Pro', amount: 199, currency: CURRENCY, status: PaymentStatus.Paid, method: 'Mastercard •••• 7733', paidAt: '2026-06-04T11:00:00Z' },
  { id: 1009, companyId: 14, companyName: 'SwiftMart Retail', invoiceNo: 'INV-2026-0430', planName: 'Free', amount: 0, currency: CURRENCY, status: PaymentStatus.Refunded, method: 'Visa •••• 9001', paidAt: '2026-04-30T07:45:00Z' },
  { id: 1010, companyId: 16, companyName: 'Quantum Health Labs', invoiceNo: 'INV-2026-0704', planName: 'Pro', amount: 199, currency: CURRENCY, status: PaymentStatus.Pending, method: 'Mastercard •••• 7733', paidAt: '2026-07-04T11:00:00Z' },
];

/** Aggregates for the KPI strip — MRR counts only active paid subscriptions. */
export function buildBillingSummary(): BillingSummary {
  const active = MOCK_ADMIN_SUBSCRIPTIONS.filter((sub) => sub.status === SubscriptionStatus.Active);
  return {
    mrr: active.reduce((total, sub) => total + sub.price, 0),
    currency: CURRENCY,
    activeSubscriptions: active.length,
    pastDue: MOCK_ADMIN_SUBSCRIPTIONS.filter((sub) => sub.status === SubscriptionStatus.PastDue).length,
    paidCompanies: MOCK_ADMIN_SUBSCRIPTIONS.filter((sub) => sub.price > 0).length,
  };
}
