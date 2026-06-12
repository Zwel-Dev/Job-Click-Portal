import { Id } from './common.model';
import { InterviewType } from '@core/enums/interview-type.enum';
import { InterviewStatus } from '@core/enums/interview-status.enum';

export interface Interview {
  id: Id;
  applicationId: Id;
  candidateName: string;
  jobTitle: string;
  roundName: string;
  interviewType: InterviewType;
  scheduledAt: string;
  meetingLink?: string;
  status: InterviewStatus;
  interviewers: string[];
  feedback?: string;
}
