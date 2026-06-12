import { StatusTone } from './application-status.enum';

/** Company account state (mirrors COMPANIES.status in the ERD). */
export enum CompanyStatus {
  Active = 'ACTIVE',
  Suspended = 'SUSPENDED',
  Closed = 'CLOSED',
}

export const COMPANY_STATUS_META: Record<CompanyStatus, { label: string; tone: StatusTone }> = {
  [CompanyStatus.Active]: { label: 'Active', tone: 'success' },
  [CompanyStatus.Suspended]: { label: 'Suspended', tone: 'danger' },
  [CompanyStatus.Closed]: { label: 'Closed', tone: 'neutral' },
};
