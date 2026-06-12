/** Type of a job's custom screening question (LinkedIn-style application questions). */
export enum ScreeningQuestionType {
  Text = 'TEXT',
  YesNo = 'YES_NO',
  SingleChoice = 'SINGLE_CHOICE',
  Numeric = 'NUMERIC',
}

export const SCREENING_QUESTION_TYPE_LABELS: Record<ScreeningQuestionType, string> = {
  [ScreeningQuestionType.Text]: 'Short answer',
  [ScreeningQuestionType.YesNo]: 'Yes / No',
  [ScreeningQuestionType.SingleChoice]: 'Multiple choice',
  [ScreeningQuestionType.Numeric]: 'Number',
};
