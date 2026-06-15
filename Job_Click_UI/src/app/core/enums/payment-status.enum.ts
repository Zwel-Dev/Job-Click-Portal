import { StatusTone } from './application-status.enum';

/** Payment lifecycle (mirrors PAYMENTS.status in the ERD). */
export enum PaymentStatus {
  Paid = 'PAID',
  Pending = 'PENDING',
  Failed = 'FAILED',
  Refunded = 'REFUNDED',
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: StatusTone }> = {
  [PaymentStatus.Paid]: { label: 'Paid', tone: 'success' },
  [PaymentStatus.Pending]: { label: 'Pending', tone: 'progress' },
  [PaymentStatus.Failed]: { label: 'Failed', tone: 'danger' },
  [PaymentStatus.Refunded]: { label: 'Refunded', tone: 'neutral' },
};
