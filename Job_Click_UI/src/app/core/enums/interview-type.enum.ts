/** Interview format (mirrors INTERVIEWS.interview_type in the ERD). */
export enum InterviewType {
  Phone = 'PHONE',
  Video = 'VIDEO',
  Onsite = 'ONSITE',
  Technical = 'TECHNICAL',
  HR = 'HR',
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  [InterviewType.Phone]: 'Phone',
  [InterviewType.Video]: 'Video call',
  [InterviewType.Onsite]: 'On-site',
  [InterviewType.Technical]: 'Technical',
  [InterviewType.HR]: 'HR',
};
