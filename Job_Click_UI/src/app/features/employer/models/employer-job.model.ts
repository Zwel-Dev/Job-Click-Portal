import { Id } from '@core/models/common.model';
import { EmploymentType } from '@core/enums/employment-type.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { SeniorityLevel } from '@core/enums/seniority-level.enum';
import { JobStatus } from '@core/enums/job-status.enum';
import { JobApprovalStage } from '@core/enums/job-approval-stage.enum';

/** A company job as shown in the employer job list. */
export interface EmployerJob {
  id: Id;
  title: string;
  status: JobStatus;
  approvalStage?: JobApprovalStage;
  employmentType: EmploymentType;
  workMode: WorkMode;
  seniorityLevel: SeniorityLevel;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  applicantCount: number;
  ownerId: Id;
  ownerName: string;
  createdAt: string;
  publishedAt?: string;
  expiredAt?: string;
}
