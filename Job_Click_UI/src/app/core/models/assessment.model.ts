import { Id } from './common.model';
import { AssessmentStatus } from '@core/enums/assessment-status.enum';

/** An assessment/test attached to an application (mirrors ASSESSMENTS in the ERD). */
export interface Assessment {
  id: Id;
  applicationId: Id;
  name: string;
  status: AssessmentStatus;
  /** Result as a percentage (0-100), once captured. */
  score?: number;
  assignedAt: string;
  submittedAt?: string;
  remarks?: string;
}

export interface AssessmentFormValue {
  name: string;
  status: AssessmentStatus;
  score?: number;
  remarks?: string;
}
