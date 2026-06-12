/** Company headcount band (mirrors COMPANIES.company_size in the ERD). */
export enum CompanySize {
  Solo = 'SOLO',
  Small = 'SMALL',
  Medium = 'MEDIUM',
  Large = 'LARGE',
  Enterprise = 'ENTERPRISE',
}

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  [CompanySize.Solo]: '1 employee',
  [CompanySize.Small]: '2–10 employees',
  [CompanySize.Medium]: '11–50 employees',
  [CompanySize.Large]: '51–200 employees',
  [CompanySize.Enterprise]: '200+ employees',
};
