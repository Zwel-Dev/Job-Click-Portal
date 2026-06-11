/** Seniority level (mirrors JOBS.seniority_level in the ERD). */
export enum SeniorityLevel {
  Entry = 'ENTRY',
  Junior = 'JUNIOR',
  Mid = 'MID',
  Senior = 'SENIOR',
  Lead = 'LEAD',
  Manager = 'MANAGER',
  Executive = 'EXECUTIVE',
}

export const SENIORITY_LEVEL_LABELS: Record<SeniorityLevel, string> = {
  [SeniorityLevel.Entry]: 'Entry level',
  [SeniorityLevel.Junior]: 'Junior',
  [SeniorityLevel.Mid]: 'Mid level',
  [SeniorityLevel.Senior]: 'Senior',
  [SeniorityLevel.Lead]: 'Lead',
  [SeniorityLevel.Manager]: 'Manager',
  [SeniorityLevel.Executive]: 'Executive',
};
