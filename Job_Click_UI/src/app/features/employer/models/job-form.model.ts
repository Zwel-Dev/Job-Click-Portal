import { EmploymentType } from '@core/enums/employment-type.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { SeniorityLevel } from '@core/enums/seniority-level.enum';
import { JobSkillRequirement } from '@core/models/job.model';
import { ScreeningQuestion } from '@core/models/screening.model';

/** The editable shape of a job (job create/edit wizard). */
export interface JobFormValue {
  title: string;
  department?: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  seniorityLevel: SeniorityLevel;
  location: string;
  description: string;
  requirements: string;
  skills: JobSkillRequirement[];
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  benefits: string[];
  screeningQuestions: ScreeningQuestion[];
}
