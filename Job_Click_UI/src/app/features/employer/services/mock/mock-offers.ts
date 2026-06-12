import { Offer } from '@core/models/offer.model';
import { OfferStatus } from '@core/enums/offer-status.enum';

/** Seed offers for the demo company. Application 9006 (Myo Thant) is in the Offer stage. */
export const MOCK_OFFERS: Offer[] = [
  {
    id: 701, applicationId: 9006, candidateName: 'Myo Thant', jobTitle: 'Senior Frontend Developer',
    offeredSalary: 3_200_000, currency: 'MMK', joiningDate: '2026-07-15',
    status: OfferStatus.Sent, offeredAt: '2026-06-08T07:00:00Z',
  },
  {
    id: 702, applicationId: 8801, candidateName: 'Hla Hla Win', jobTitle: 'Frontend Intern',
    offeredSalary: 550_000, currency: 'MMK', joiningDate: '2026-05-01',
    status: OfferStatus.Accepted, offeredAt: '2026-04-20T07:00:00Z',
  },
];
