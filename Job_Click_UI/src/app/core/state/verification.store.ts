import { Injectable } from '@angular/core';
import { Id } from '@core/models/common.model';
import { CompanyVerification, VerificationDocument, VerificationFormValue } from '@core/models/company.model';
import { VerificationReviewItem, VerificationDecision } from '@core/models/verification-review.model';
import { VerificationStatus } from '@core/enums/verification-status.enum';

/**
 * Canonical verification record (admin + company view combined). Owns the company
 * identity needed by the admin queue plus the full COMPANY_VERIFICATIONS fields.
 */
interface VerificationRecord {
  companyId: Id;
  companyName: string;
  companyCode: string;
  id: Id;
  registrationNo?: string;
  taxNo?: string;
  officialEmail?: string;
  website?: string;
  documents: VerificationDocument[];
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  /** verified_by — the admin who approved/rejected. */
  reviewedBy?: string;
  rejectionReason?: string;
}

const SAMPLE_DOC = '/assets/mock/files/sample-resume.pdf';

/**
 * Seed verification state across the platform. Greenline (10) starts Unverified
 * so the full CA1.4 → PA1.3 loop is demoable (submit → queue → approve); Apex
 * (13) and Quantum (16) start Pending so the admin queue has work out of the box.
 */
const VERIFICATION_SEED: readonly VerificationRecord[] = [
  {
    companyId: 10, companyName: 'Greenline Technologies', companyCode: 'GLT-0010', id: 10,
    status: VerificationStatus.Unverified, documents: [],
  },
  {
    companyId: 11, companyName: 'BrightPath Solutions', companyCode: 'BPS-0011', id: 11,
    registrationNo: 'REG-2025-002201', taxNo: 'TAX-77-0011', officialEmail: 'admin@brightpath.example',
    website: 'https://brightpath.example', status: VerificationStatus.Verified,
    submittedAt: '2025-08-10T09:00:00Z', reviewedAt: '2025-08-12T06:00:00Z', reviewedBy: 'Aung Myo Thant',
    documents: [{ id: 1, label: 'Business registration', fileName: 'brightpath-registration.pdf', fileUrl: SAMPLE_DOC, uploadedAt: '2025-08-10T09:00:00Z' }],
  },
  {
    companyId: 12, companyName: 'BlueWave Logistics', companyCode: 'BWL-0012', id: 12,
    registrationNo: 'REG-2025-001188', taxNo: 'TAX-77-0012', officialEmail: 'ops@bluewave.example',
    website: 'https://bluewave.example', status: VerificationStatus.Verified,
    submittedAt: '2025-02-25T09:00:00Z', reviewedAt: '2025-02-27T06:00:00Z', reviewedBy: 'Aung Myo Thant',
    documents: [{ id: 1, label: 'Business registration', fileName: 'bluewave-registration.pdf', fileUrl: SAMPLE_DOC, uploadedAt: '2025-02-25T09:00:00Z' }],
  },
  {
    companyId: 13, companyName: 'Apex Finance Group', companyCode: 'AFG-0013', id: 13,
    registrationNo: 'REG-2026-004411', taxNo: 'TAX-77-0013', officialEmail: 'compliance@apexfinance.example',
    website: 'https://apexfinance.example', status: VerificationStatus.Pending, submittedAt: '2026-06-14T08:10:00Z',
    documents: [{ id: 1, label: 'Business registration', fileName: 'apex-registration.pdf', fileUrl: SAMPLE_DOC, uploadedAt: '2026-06-14T08:10:00Z' }],
  },
  {
    companyId: 14, companyName: 'SwiftMart Retail', companyCode: 'SMR-0014', id: 14,
    registrationNo: 'REG-2026-003090', officialEmail: 'hello@swiftmart.example',
    status: VerificationStatus.Rejected, submittedAt: '2026-05-20T09:00:00Z',
    reviewedAt: '2026-05-22T06:00:00Z', reviewedBy: 'Aung Myo Thant',
    rejectionReason: 'Submitted registration document was illegible. Please re-upload a clear copy.',
    documents: [{ id: 1, label: 'Business registration', fileName: 'swiftmart-registration.pdf', fileUrl: SAMPLE_DOC, uploadedAt: '2026-05-20T09:00:00Z' }],
  },
  {
    companyId: 15, companyName: 'Horizon Media House', companyCode: 'HMH-0015', id: 15,
    registrationNo: 'REG-2025-003355', taxNo: 'TAX-77-0015', officialEmail: 'admin@horizonmedia.example',
    website: 'https://horizonmedia.example', status: VerificationStatus.Verified,
    submittedAt: '2025-12-15T09:00:00Z', reviewedAt: '2025-12-17T06:00:00Z', reviewedBy: 'Aung Myo Thant',
    documents: [{ id: 1, label: 'Business registration', fileName: 'horizon-registration.pdf', fileUrl: SAMPLE_DOC, uploadedAt: '2025-12-15T09:00:00Z' }],
  },
  {
    companyId: 16, companyName: 'Quantum Health Labs', companyCode: 'QHL-0016', id: 16,
    registrationNo: 'REG-2026-004890', taxNo: 'TAX-77-0016', officialEmail: 'ops@quantumhealth.example',
    website: 'https://quantumhealth.example', status: VerificationStatus.Pending, submittedAt: '2026-06-14T15:45:00Z',
    documents: [
      { id: 1, label: 'Business registration', fileName: 'quantum-registration.pdf', fileUrl: SAMPLE_DOC, uploadedAt: '2026-06-14T15:45:00Z' },
      { id: 2, label: 'Medical operating licence', fileName: 'quantum-licence.pdf', fileUrl: SAMPLE_DOC, uploadedAt: '2026-06-14T15:45:00Z' },
    ],
  },
];

/**
 * Single source of truth for company verification — shared by the Company Admin
 * verification centre (CA1.4, via `CompanyService`) and the Platform Admin review
 * queue (PA1.3, via `VerificationReviewService`). An admin Approve here flips the
 * company's `Verified` badge on the employer side, and a CA1.4 submit surfaces in
 * the admin queue. Root-scoped so all consumers share one in-memory dataset.
 */
@Injectable({ providedIn: 'root' })
export class VerificationStore {
  private records: VerificationRecord[] = clone([...VERIFICATION_SEED]);

  /** Current status for a company (Unverified when no record exists). */
  statusFor(companyId: Id): VerificationStatus {
    return this.records.find((record) => record.companyId === companyId)?.status ?? VerificationStatus.Unverified;
  }

  isVerified(companyId: Id): boolean {
    return this.statusFor(companyId) === VerificationStatus.Verified;
  }

  /** The company-side verification record (CA1.4 view). */
  getCompanyVerification(companyId: Id): CompanyVerification {
    const record = this.records.find((item) => item.companyId === companyId);
    if (!record) {
      return { id: companyId, status: VerificationStatus.Unverified, documents: [] };
    }
    return toCompanyVerification(record);
  }

  /** The admin review queue — companies awaiting review, newest submission first. */
  pendingQueue(): VerificationReviewItem[] {
    return this.records
      .filter((record) => record.status === VerificationStatus.Pending)
      .map(toReviewItem)
      .sort((a, b) => submittedTime(b) - submittedTime(a));
  }

  /** Company-side submit / resubmit → Pending (clears any prior decision). */
  submit(companyId: Id, value: VerificationFormValue): void {
    const now = new Date().toISOString();
    const documents: VerificationDocument[] = value.documents.map((doc, index) => ({
      id: index + 1,
      label: doc.label,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      uploadedAt: now,
    }));
    const existing = this.records.find((record) => record.companyId === companyId);
    if (existing) {
      Object.assign(existing, {
        registrationNo: value.registrationNo,
        taxNo: value.taxNo,
        website: value.website,
        officialEmail: value.officialEmail,
        documents,
        status: VerificationStatus.Pending,
        submittedAt: now,
        reviewedAt: undefined,
        reviewedBy: undefined,
        rejectionReason: undefined,
      });
    }
  }

  /** Admin decision → Verified (stamps verified_by/at) or Rejected (+ reason). */
  review(decision: VerificationDecision, reviewerName: string): void {
    const record = this.records.find((item) => item.companyId === decision.companyId);
    if (!record) {
      return;
    }
    record.status = decision.approve ? VerificationStatus.Verified : VerificationStatus.Rejected;
    record.reviewedAt = new Date().toISOString();
    record.reviewedBy = reviewerName;
    record.rejectionReason = decision.approve ? undefined : decision.reason;
  }
}

function toCompanyVerification(record: VerificationRecord): CompanyVerification {
  return {
    id: record.id,
    registrationNo: record.registrationNo,
    taxNo: record.taxNo,
    website: record.website,
    officialEmail: record.officialEmail,
    status: record.status,
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    rejectionReason: record.rejectionReason,
    documents: clone(record.documents),
  };
}

function toReviewItem(record: VerificationRecord): VerificationReviewItem {
  return {
    companyId: record.companyId,
    companyName: record.companyName,
    registrationNo: record.registrationNo,
    taxNo: record.taxNo,
    officialEmail: record.officialEmail,
    website: record.website,
    documents: clone(record.documents),
    status: record.status,
    submittedAt: record.submittedAt,
  };
}

function submittedTime(item: { submittedAt?: string }): number {
  return item.submittedAt ? Date.parse(item.submittedAt) : 0;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
