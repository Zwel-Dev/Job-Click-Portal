import { Id } from './common.model';
import { CompanyStatus } from '@core/enums/company-status.enum';
import { CompanySize } from '@core/enums/company-size.enum';
import { VerificationStatus } from '@core/enums/verification-status.enum';

/** A company/organization (mirrors COMPANIES in the ERD). */
export interface Company {
  id: Id;
  companyCode: string;
  name: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companySize?: CompanySize;
  description?: string;
  status: CompanyStatus;
  verified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CompanyProfileFormValue {
  name: string;
  website?: string;
  industry?: string;
  companySize?: CompanySize;
  description?: string;
}

/** An office/site (mirrors COMPANY_LOCATIONS in the ERD). */
export interface CompanyLocation {
  id: Id;
  country: string;
  state?: string;
  city: string;
  address?: string;
  postalCode?: string;
  isHeadOffice: boolean;
}

export interface CompanyLocationFormValue {
  country: string;
  state?: string;
  city: string;
  address?: string;
  postalCode?: string;
  isHeadOffice: boolean;
}

/** An org unit that owns jobs (mirrors DEPARTMENTS in the ERD). */
export interface Department {
  id: Id;
  name: string;
  description?: string;
  jobCount: number;
}

export interface DepartmentFormValue {
  name: string;
  description?: string;
}

export interface VerificationDocument {
  id: Id;
  label: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

/** Company verification record (mirrors COMPANY_VERIFICATIONS in the ERD). */
export interface CompanyVerification {
  id: Id;
  registrationNo?: string;
  taxNo?: string;
  website?: string;
  officialEmail?: string;
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents: VerificationDocument[];
}

export interface VerificationFormValue {
  registrationNo: string;
  taxNo?: string;
  website?: string;
  officialEmail: string;
  documents: { label: string; fileName: string; fileUrl: string }[];
}
