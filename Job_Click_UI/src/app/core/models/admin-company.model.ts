import { Id } from './common.model';
import { CompanyLocation } from './company.model';
import { CompanyStatus } from '@core/enums/company-status.enum';
import { CompanySize } from '@core/enums/company-size.enum';
import { VerificationStatus } from '@core/enums/verification-status.enum';

/** A company as seen by the platform admin (COMPANIES + counts + plan). */
export interface AdminCompany {
  id: Id;
  name: string;
  companyCode: string;
  status: CompanyStatus;
  verified: boolean;
  verificationStatus: VerificationStatus;
  industry?: string;
  companySize?: CompanySize;
  planName?: string;
  jobsCount: number;
  membersCount: number;
  createdAt: string;
}

/** Expanded company record for the admin company-detail screen (PA1.2). */
export interface AdminCompanyDetail extends AdminCompany {
  website?: string;
  locations: CompanyLocation[];
  admins: { fullName: string; email: string }[];
}

/** Query for the admin company list (search + filters + pagination). */
export interface AdminCompanyQuery {
  keyword?: string;
  status?: CompanyStatus;
  verified?: boolean;
  page: number;
  pageSize: number;
}
