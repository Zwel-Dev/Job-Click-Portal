/** Employment type (mirrors JOBS.employment_type in the ERD). */
export enum EmploymentType {
  FullTime = 'FULL_TIME',
  PartTime = 'PART_TIME',
  Contract = 'CONTRACT',
  Internship = 'INTERNSHIP',
  Temporary = 'TEMPORARY',
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: 'Full-time',
  [EmploymentType.PartTime]: 'Part-time',
  [EmploymentType.Contract]: 'Contract',
  [EmploymentType.Internship]: 'Internship',
  [EmploymentType.Temporary]: 'Temporary',
};
