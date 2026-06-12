import { Id } from './common.model';
import { ScreeningQuestionType } from '@core/enums/screening-question-type.enum';

/** A custom question a candidate must/can answer when applying to a job. */
export interface ScreeningQuestion {
  id: Id;
  type: ScreeningQuestionType;
  prompt: string;
  required: boolean;
  /** Options for SingleChoice questions. */
  options?: string[];
}

/** A candidate's answer to a screening question (denormalised for display). */
export interface ScreeningAnswer {
  questionId: Id;
  prompt: string;
  type: ScreeningQuestionType;
  /** Stored as a string: 'Yes'/'No', the chosen option, free text, or a number. */
  answer: string;
}

/** A reusable question shape (no id) — the recruiter picks these as a starting point. */
export type ScreeningQuestionTemplate = Omit<ScreeningQuestion, 'id'>;

/** Predefined questions recruiters can add with one click. */
export const SCREENING_QUESTION_TEMPLATES: ScreeningQuestionTemplate[] = [
  { type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', required: true },
  {
    type: ScreeningQuestionType.SingleChoice,
    prompt: 'What is your notice period?',
    required: true,
    options: ['Immediate', '2 weeks', '1 month', '2+ months'],
  },
  { type: ScreeningQuestionType.Numeric, prompt: 'How many years of relevant experience do you have?', required: true },
  { type: ScreeningQuestionType.Numeric, prompt: 'What is your expected monthly salary (MMK)?', required: false },
  { type: ScreeningQuestionType.YesNo, prompt: 'Are you willing to work on-site?', required: false },
  {
    type: ScreeningQuestionType.SingleChoice,
    prompt: 'When can you start?',
    required: false,
    options: ['Immediately', 'Within 1 month', 'Within 2 months', 'Flexible'],
  },
  { type: ScreeningQuestionType.YesNo, prompt: 'Are you willing to relocate?', required: false },
  {
    type: ScreeningQuestionType.SingleChoice,
    prompt: 'What is your highest level of education?',
    required: false,
    options: ['High school', 'Diploma', "Bachelor's", "Master's", 'PhD'],
  },
];
