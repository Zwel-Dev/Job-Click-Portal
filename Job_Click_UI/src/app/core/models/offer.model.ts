import { Id } from './common.model';
import { OfferStatus } from '@core/enums/offer-status.enum';

export interface Offer {
  id: Id;
  applicationId: Id;
  candidateName: string;
  jobTitle: string;
  offeredSalary: number;
  currency: string;
  joiningDate?: string;
  status: OfferStatus;
  offeredAt: string;
}

export interface OfferFormValue {
  offeredSalary: number;
  currency: string;
  joiningDate?: string;
  notes?: string;
}
