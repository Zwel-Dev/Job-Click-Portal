import { Id } from './common.model';
import { VerificationDocument } from './company.model';
import { VerificationStatus } from '@core/enums/verification-status.enum';

/**
 * A company verification submission awaiting (or already passed) admin review —
 * the admin side of COMPANY_VERIFICATIONS. Pairs with Company Admin CA1.4.
 */
export interface VerificationReviewItem {
  companyId: Id;
  companyName: string;
  registrationNo?: string;
  taxNo?: string;
  officialEmail?: string;
  website?: string;
  documents: VerificationDocument[];
  status: VerificationStatus;
  submittedAt?: string;
}

/** An admin's approve/reject decision on a verification submission (PA1.3). */
export interface VerificationDecision {
  companyId: Id;
  approve: boolean;
  reason?: string;
}
