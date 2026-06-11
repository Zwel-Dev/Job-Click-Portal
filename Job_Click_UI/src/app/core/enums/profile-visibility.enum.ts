/** Candidate profile visibility (mirrors CANDIDATE_PROFILES.profile_visibility in the ERD). */
export enum ProfileVisibility {
  Public = 'PUBLIC',
  RecruitersOnly = 'RECRUITERS_ONLY',
  Private = 'PRIVATE',
}

export const PROFILE_VISIBILITY_LABELS: Record<ProfileVisibility, string> = {
  [ProfileVisibility.Public]: 'Public',
  [ProfileVisibility.RecruitersOnly]: 'Recruiters only',
  [ProfileVisibility.Private]: 'Private',
};
