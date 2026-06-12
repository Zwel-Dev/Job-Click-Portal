import { JobSkillRequirement } from '@core/models/job.model';
import { ScreeningQuestion } from '@core/models/screening.model';
import { EmployerJob } from './employer-job.model';

/** Full job detail for the employer detail view (list meta + editable content). */
export interface EmployerJobDetail extends EmployerJob {
  department?: string;
  description: string;
  requirements: string;
  skills: JobSkillRequirement[];
  benefits: string[];
  screeningQuestions: ScreeningQuestion[];
}
