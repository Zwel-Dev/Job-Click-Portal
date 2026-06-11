/** Work arrangement (mirrors JOBS.work_mode in the ERD). */
export enum WorkMode {
  Onsite = 'ONSITE',
  Remote = 'REMOTE',
  Hybrid = 'HYBRID',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  [WorkMode.Onsite]: 'On-site',
  [WorkMode.Remote]: 'Remote',
  [WorkMode.Hybrid]: 'Hybrid',
};
