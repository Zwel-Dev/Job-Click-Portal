import { Resume } from '@core/models/candidate.model';

/** The candidate's uploaded resumes (one default). */
export const MOCK_RESUMES: Resume[] = [
  {
    id: 1,
    fileName: 'Su_Su_Hlaing_Resume.pdf',
    fileUrl: 'assets/mock/files/sample-resume.pdf',
    sizeBytes: 245_000,
    isDefault: true,
    uploadedAt: '2026-05-10T09:00:00Z',
  },
  {
    id: 2,
    fileName: 'Su_Su_Hlaing_Frontend_CV.pdf',
    fileUrl: 'assets/mock/files/sample-resume.pdf',
    sizeBytes: 198_000,
    isDefault: false,
    uploadedAt: '2026-04-22T09:00:00Z',
  },
];
