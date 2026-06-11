/** Skill proficiency (mirrors CANDIDATE_SKILLS.proficiency_level in the ERD). */
export enum ProficiencyLevel {
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE',
  Advanced = 'ADVANCED',
  Expert = 'EXPERT',
}

export const PROFICIENCY_LEVEL_LABELS: Record<ProficiencyLevel, string> = {
  [ProficiencyLevel.Beginner]: 'Beginner',
  [ProficiencyLevel.Intermediate]: 'Intermediate',
  [ProficiencyLevel.Advanced]: 'Advanced',
  [ProficiencyLevel.Expert]: 'Expert',
};
