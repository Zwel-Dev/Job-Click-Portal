import { StatusTone } from './application-status.enum';

/** Offer lifecycle (mirrors OFFERS.offer_status in the ERD). */
export enum OfferStatus {
  Draft = 'DRAFT',
  Sent = 'SENT',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
  Withdrawn = 'WITHDRAWN',
  Expired = 'EXPIRED',
}

export const OFFER_STATUS_META: Record<OfferStatus, { label: string; tone: StatusTone }> = {
  [OfferStatus.Draft]: { label: 'Draft', tone: 'neutral' },
  [OfferStatus.Sent]: { label: 'Sent', tone: 'progress' },
  [OfferStatus.Accepted]: { label: 'Accepted', tone: 'success' },
  [OfferStatus.Rejected]: { label: 'Rejected', tone: 'danger' },
  [OfferStatus.Withdrawn]: { label: 'Withdrawn', tone: 'neutral' },
  [OfferStatus.Expired]: { label: 'Expired', tone: 'neutral' },
};
