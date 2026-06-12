import { Id } from '@core/models/common.model';
import { ApplicationStatus } from '@core/enums/application-status.enum';
import { ProficiencyLevel } from '@core/enums/proficiency-level.enum';
import { ScreeningQuestionType } from '@core/enums/screening-question-type.enum';
import { ApplicantDetail } from '@core/models/applicant.model';

/** Applicant literals without job context — the service stamps jobId/jobTitle from the map key. */
export type MockApplicant = Omit<ApplicantDetail, 'jobId' | 'jobTitle'>;

/** Placeholder resume file the candidates attached (served from assets). */
const SAMPLE_RESUME = 'assets/mock/files/sample-resume.pdf';

/**
 * Applicants in each job's pipeline, keyed by jobId. Full detail objects; the
 * board projects them to summaries. Statuses use PIPELINE_BOARD_STAGES only.
 */
export const MOCK_APPLICANTS: Record<Id, MockApplicant[]> = {
  301: [
    {
      applicationId: 9001, candidateId: 1101, fullName: 'Su Su Hlaing',
      headline: 'Frontend Developer · Angular & TypeScript', status: ApplicationStatus.Interview,
      matchScore: 92, appliedAt: '2026-06-02T08:30:00Z', resumeId: 1, tags: ['Top pick', 'Angular'],
      email: 'su.hlaing@example.com', phone: '+95 9 770 000 101', location: 'Yangon, Myanmar',
      coverNote:
        'Four years building production Angular apps; I led my team’s design-system rebuild. I’m keen on your enterprise UX focus and can start within a month.',
      resumeName: 'Su-Su-Hlaing-CV.pdf', resumeUrl: SAMPLE_RESUME,
      screeningAnswers: [
        { questionId: 1, type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', answer: 'Yes' },
        { questionId: 2, type: ScreeningQuestionType.Numeric, prompt: 'How many years of Angular experience do you have?', answer: '4' },
        { questionId: 3, type: ScreeningQuestionType.SingleChoice, prompt: 'What is your notice period?', answer: '1 month' },
      ],
      skills: [
        { name: 'Angular', proficiency: ProficiencyLevel.Expert },
        { name: 'TypeScript', proficiency: ProficiencyLevel.Advanced },
        { name: 'RxJS', proficiency: ProficiencyLevel.Advanced },
        { name: 'SCSS', proficiency: ProficiencyLevel.Intermediate },
      ],
      experiences: [
        { id: 1, companyName: 'Bluewave Studio', jobTitle: 'Frontend Developer', startDate: '2022-03-01', currentJob: true, responsibilities: 'Built and maintained the company SPA in Angular.' },
        { id: 2, companyName: 'Nova Apps', jobTitle: 'Junior Developer', startDate: '2020-06-01', endDate: '2022-02-01', currentJob: false },
      ],
      educations: [
        { id: 1, institution: 'University of Yangon', degree: 'B.C.Sc.', major: 'Computer Science', graduationYear: 2020 },
      ],
      notes: [
        { id: 1, author: 'Kyaw Zin Latt', body: 'Strong portfolio. Scheduled for a technical interview.', createdAt: '2026-06-05T04:00:00Z' },
      ],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-02T08:30:00Z' },
        { status: ApplicationStatus.Screening, changedAt: '2026-06-03T03:00:00Z' },
        { status: ApplicationStatus.Shortlisted, changedAt: '2026-06-04T06:00:00Z' },
        { status: ApplicationStatus.Interview, changedAt: '2026-06-05T04:00:00Z' },
      ],
      match: { jobId: 301, total: 92, skill: 95, experience: 88, location: 100, salary: 85, education: 90, calculatedAt: '2026-06-02T08:30:00Z' },
    },
    {
      applicationId: 9002, candidateId: 1102, fullName: 'Aung Ko Ko',
      headline: 'Senior UI Engineer', status: ApplicationStatus.Shortlisted,
      matchScore: 84, appliedAt: '2026-06-03T09:10:00Z', resumeId: 1, tags: ['React'],
      email: 'aung.koko@example.com', phone: '+95 9 770 000 102', location: 'Yangon, Myanmar',
      coverNote:
        'Senior UI engineer moving from React to Angular. I bring strong component architecture and accessibility experience.',
      resumeName: 'Aung-Ko-Ko-Resume.pdf', resumeUrl: SAMPLE_RESUME,
      screeningAnswers: [
        { questionId: 1, type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', answer: 'Yes' },
        { questionId: 2, type: ScreeningQuestionType.Numeric, prompt: 'How many years of Angular experience do you have?', answer: '3' },
        { questionId: 3, type: ScreeningQuestionType.SingleChoice, prompt: 'What is your notice period?', answer: '1 month' },
      ],
      skills: [
        { name: 'React', proficiency: ProficiencyLevel.Expert },
        { name: 'TypeScript', proficiency: ProficiencyLevel.Advanced },
        { name: 'Angular', proficiency: ProficiencyLevel.Intermediate },
      ],
      experiences: [
        { id: 1, companyName: 'Pixel Forge', jobTitle: 'Senior UI Engineer', startDate: '2021-01-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'Yangon Technological University', degree: 'B.E.', major: 'Electronics', graduationYear: 2018 },
      ],
      notes: [],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-03T09:10:00Z' },
        { status: ApplicationStatus.Screening, changedAt: '2026-06-04T02:00:00Z' },
        { status: ApplicationStatus.Shortlisted, changedAt: '2026-06-05T05:00:00Z' },
      ],
      match: { jobId: 301, total: 84, skill: 82, experience: 90, location: 100, salary: 70, education: 80, calculatedAt: '2026-06-03T09:10:00Z' },
    },
    {
      applicationId: 9003, candidateId: 1103, fullName: 'Hnin Wai',
      headline: 'Frontend Developer', status: ApplicationStatus.Screening,
      matchScore: 78, appliedAt: '2026-06-04T11:00:00Z', resumeId: 1, tags: [],
      email: 'hnin.wai@example.com', location: 'Mandalay, Myanmar',
      coverNote:
        'Frontend developer with a Vue background, comfortable picking up Angular quickly. I’m based in Mandalay and open to relocation.',
      resumeName: 'Hnin-Wai-CV.pdf', resumeUrl: SAMPLE_RESUME,
      screeningAnswers: [
        { questionId: 1, type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', answer: 'Yes' },
        { questionId: 2, type: ScreeningQuestionType.Numeric, prompt: 'How many years of Angular experience do you have?', answer: '2' },
        { questionId: 3, type: ScreeningQuestionType.SingleChoice, prompt: 'What is your notice period?', answer: 'Immediate' },
      ],
      skills: [
        { name: 'Vue', proficiency: ProficiencyLevel.Advanced },
        { name: 'JavaScript', proficiency: ProficiencyLevel.Advanced },
        { name: 'CSS', proficiency: ProficiencyLevel.Advanced },
      ],
      experiences: [
        { id: 1, companyName: 'Mandalay Soft', jobTitle: 'Web Developer', startDate: '2021-07-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'Mandalay University', degree: 'B.C.Sc.', major: 'Computer Science', graduationYear: 2021 },
      ],
      notes: [],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-04T11:00:00Z' },
        { status: ApplicationStatus.Screening, changedAt: '2026-06-05T03:00:00Z' },
      ],
      match: { jobId: 301, total: 78, skill: 72, experience: 75, location: 60, salary: 90, education: 85, calculatedAt: '2026-06-04T11:00:00Z' },
    },
    {
      applicationId: 9004, candidateId: 1104, fullName: 'Zaw Min Tun',
      headline: 'Full-stack Developer', status: ApplicationStatus.Applied,
      matchScore: 71, appliedAt: '2026-06-06T07:45:00Z', resumeId: 1, tags: ['Node.js'],
      email: 'zaw.mintun@example.com', phone: '+95 9 770 000 104', location: 'Yangon, Myanmar',
      coverNote:
        'Full-stack developer who enjoys owning features end to end. I’m looking to focus more deeply on frontend work.',
      resumeName: 'Zaw-Min-Tun-Resume.pdf', resumeUrl: SAMPLE_RESUME,
      screeningAnswers: [
        { questionId: 1, type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', answer: 'Yes' },
        { questionId: 2, type: ScreeningQuestionType.Numeric, prompt: 'How many years of Angular experience do you have?', answer: '3' },
        { questionId: 3, type: ScreeningQuestionType.SingleChoice, prompt: 'What is your notice period?', answer: '2 weeks' },
      ],
      skills: [
        { name: 'Angular', proficiency: ProficiencyLevel.Intermediate },
        { name: 'Node.js', proficiency: ProficiencyLevel.Advanced },
        { name: 'SQL', proficiency: ProficiencyLevel.Intermediate },
      ],
      experiences: [
        { id: 1, companyName: 'Greenfield IT', jobTitle: 'Full-stack Developer', startDate: '2022-09-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'University of Computer Studies, Yangon', degree: 'B.C.Sc.', major: 'Software Engineering', graduationYear: 2022 },
      ],
      notes: [],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-06T07:45:00Z' },
      ],
      match: { jobId: 301, total: 71, skill: 68, experience: 65, location: 100, salary: 75, education: 80, calculatedAt: '2026-06-06T07:45:00Z' },
    },
    {
      applicationId: 9005, candidateId: 1105, fullName: 'Ei Mon',
      headline: 'UI Developer · Design systems', status: ApplicationStatus.Applied,
      matchScore: 66, appliedAt: '2026-06-07T10:20:00Z', resumeId: 1, tags: [],
      email: 'ei.mon@example.com', location: 'Yangon, Myanmar',
      resumeName: 'Ei-Mon-CV.pdf', resumeUrl: SAMPLE_RESUME,
      screeningAnswers: [
        { questionId: 1, type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', answer: 'Yes' },
        { questionId: 2, type: ScreeningQuestionType.Numeric, prompt: 'How many years of Angular experience do you have?', answer: '1' },
        { questionId: 3, type: ScreeningQuestionType.SingleChoice, prompt: 'What is your notice period?', answer: '2+ months' },
      ],
      skills: [
        { name: 'Angular', proficiency: ProficiencyLevel.Beginner },
        { name: 'Figma', proficiency: ProficiencyLevel.Advanced },
        { name: 'HTML', proficiency: ProficiencyLevel.Advanced },
      ],
      experiences: [
        { id: 1, companyName: 'Crafton', jobTitle: 'UI Developer', startDate: '2023-02-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'National Management Degree College', degree: 'B.A.', major: 'Design', graduationYear: 2022 },
      ],
      notes: [],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-07T10:20:00Z' },
      ],
      match: { jobId: 301, total: 66, skill: 60, experience: 55, location: 100, salary: 70, education: 75, calculatedAt: '2026-06-07T10:20:00Z' },
    },
    {
      applicationId: 9006, candidateId: 1106, fullName: 'Myo Thant',
      headline: 'Senior Frontend Engineer', status: ApplicationStatus.Offer,
      matchScore: 89, appliedAt: '2026-05-29T08:00:00Z', resumeId: 1, tags: ['Top pick'],
      email: 'myo.thant@example.com', phone: '+95 9 770 000 106', location: 'Yangon, Myanmar',
      coverNote:
        'Senior frontend engineer with deep Angular and NgRx experience. I’ve mentored teams and shipped large-scale SPAs.',
      resumeName: 'Myo-Thant-Resume.pdf', resumeUrl: SAMPLE_RESUME,
      screeningAnswers: [
        { questionId: 1, type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', answer: 'Yes' },
        { questionId: 2, type: ScreeningQuestionType.Numeric, prompt: 'How many years of Angular experience do you have?', answer: '6' },
        { questionId: 3, type: ScreeningQuestionType.SingleChoice, prompt: 'What is your notice period?', answer: '2 weeks' },
      ],
      skills: [
        { name: 'Angular', proficiency: ProficiencyLevel.Expert },
        { name: 'TypeScript', proficiency: ProficiencyLevel.Expert },
        { name: 'NgRx', proficiency: ProficiencyLevel.Advanced },
      ],
      experiences: [
        { id: 1, companyName: 'Skylink', jobTitle: 'Senior Frontend Engineer', startDate: '2019-05-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'Yangon Technological University', degree: 'B.E.', major: 'IT', graduationYear: 2017 },
      ],
      notes: [
        { id: 1, author: 'Kyaw Zin Latt', body: 'Excellent interview. Preparing an offer.', createdAt: '2026-06-08T06:00:00Z' },
      ],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-05-29T08:00:00Z' },
        { status: ApplicationStatus.Screening, changedAt: '2026-05-30T03:00:00Z' },
        { status: ApplicationStatus.Shortlisted, changedAt: '2026-06-01T06:00:00Z' },
        { status: ApplicationStatus.Interview, changedAt: '2026-06-04T04:00:00Z' },
        { status: ApplicationStatus.Offer, changedAt: '2026-06-08T06:00:00Z' },
      ],
      match: { jobId: 301, total: 89, skill: 92, experience: 95, location: 100, salary: 70, education: 80, calculatedAt: '2026-05-29T08:00:00Z' },
    },
    {
      applicationId: 9007, candidateId: 1107, fullName: 'Khaing Thazin',
      headline: 'Junior Frontend Developer', status: ApplicationStatus.Rejected,
      matchScore: 48, appliedAt: '2026-06-01T09:00:00Z', resumeId: 1, tags: [],
      email: 'khaing.thazin@example.com', location: 'Yangon, Myanmar',
      coverNote:
        'Early-career developer eager to grow. I’ve built small client sites and am committed to levelling up quickly.',
      resumeName: 'Khaing-Thazin-CV.pdf', resumeUrl: SAMPLE_RESUME,
      screeningAnswers: [
        { questionId: 1, type: ScreeningQuestionType.YesNo, prompt: 'Are you legally authorized to work in Myanmar?', answer: 'No' },
        { questionId: 2, type: ScreeningQuestionType.Numeric, prompt: 'How many years of Angular experience do you have?', answer: '0' },
        { questionId: 3, type: ScreeningQuestionType.SingleChoice, prompt: 'What is your notice period?', answer: 'Immediate' },
      ],
      skills: [
        { name: 'HTML', proficiency: ProficiencyLevel.Intermediate },
        { name: 'CSS', proficiency: ProficiencyLevel.Intermediate },
        { name: 'JavaScript', proficiency: ProficiencyLevel.Beginner },
      ],
      experiences: [
        { id: 1, companyName: 'Freelance', jobTitle: 'Web Designer', startDate: '2023-06-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'KMD Institute', degree: 'Diploma', major: 'Web Development', graduationYear: 2023 },
      ],
      notes: [
        { id: 1, author: 'Kyaw Zin Latt', body: 'Not enough framework experience for a senior role.', createdAt: '2026-06-03T07:00:00Z' },
      ],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-01T09:00:00Z' },
        { status: ApplicationStatus.Screening, changedAt: '2026-06-02T03:00:00Z' },
        { status: ApplicationStatus.Rejected, changedAt: '2026-06-03T07:00:00Z' },
      ],
      match: { jobId: 301, total: 48, skill: 40, experience: 35, location: 100, salary: 80, education: 60, calculatedAt: '2026-06-01T09:00:00Z' },
    },
  ],
  302: [
    {
      applicationId: 9101, candidateId: 1201, fullName: 'Wai Yan Phyo',
      headline: 'DevOps Engineer · Kubernetes', status: ApplicationStatus.Screening,
      matchScore: 81, appliedAt: '2026-06-05T08:00:00Z', resumeId: 1, tags: ['AWS'],
      email: 'wai.yanphyo@example.com', phone: '+95 9 770 000 201', location: 'Yangon, Myanmar',
      coverNote:
        'DevOps engineer specialising in Kubernetes and AWS. I’ve cut deployment times significantly at my current company.',
      resumeName: 'Wai-Yan-Phyo-Resume.pdf', resumeUrl: SAMPLE_RESUME,
      skills: [
        { name: 'Docker', proficiency: ProficiencyLevel.Expert },
        { name: 'Kubernetes', proficiency: ProficiencyLevel.Advanced },
        { name: 'AWS', proficiency: ProficiencyLevel.Advanced },
      ],
      experiences: [
        { id: 1, companyName: 'CloudPoint', jobTitle: 'DevOps Engineer', startDate: '2021-04-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'Yangon Technological University', degree: 'B.E.', major: 'Computer Engineering', graduationYear: 2019 },
      ],
      notes: [],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-05T08:00:00Z' },
        { status: ApplicationStatus.Screening, changedAt: '2026-06-06T03:00:00Z' },
      ],
      match: { jobId: 302, total: 81, skill: 85, experience: 80, location: 100, salary: 65, education: 75, calculatedAt: '2026-06-05T08:00:00Z' },
    },
    {
      applicationId: 9102, candidateId: 1202, fullName: 'Thandar Soe',
      headline: 'Site Reliability Engineer', status: ApplicationStatus.Applied,
      matchScore: 74, appliedAt: '2026-06-06T10:00:00Z', resumeId: 1, tags: [],
      email: 'thandar.soe@example.com', location: 'Remote',
      resumeName: 'Thandar-Soe-CV.pdf', resumeUrl: SAMPLE_RESUME,
      skills: [
        { name: 'Terraform', proficiency: ProficiencyLevel.Advanced },
        { name: 'AWS', proficiency: ProficiencyLevel.Intermediate },
        { name: 'Python', proficiency: ProficiencyLevel.Advanced },
      ],
      experiences: [
        { id: 1, companyName: 'Datawave', jobTitle: 'SRE', startDate: '2022-01-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'University of Computer Studies, Yangon', degree: 'B.C.Sc.', major: 'Computer Science', graduationYear: 2020 },
      ],
      notes: [],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-06T10:00:00Z' },
      ],
      match: { jobId: 302, total: 74, skill: 70, experience: 72, location: 100, salary: 60, education: 80, calculatedAt: '2026-06-06T10:00:00Z' },
    },
    {
      applicationId: 9103, candidateId: 1203, fullName: 'Nyein Chan',
      headline: 'Cloud Engineer', status: ApplicationStatus.Interview,
      matchScore: 86, appliedAt: '2026-06-03T08:30:00Z', resumeId: 1, tags: ['Top pick', 'GCP'],
      email: 'nyein.chan@example.com', phone: '+95 9 770 000 203', location: 'Yangon, Myanmar',
      coverNote:
        'Cloud engineer with multi-cloud experience across GCP and AWS. I focus on reliable CI/CD and infrastructure as code.',
      resumeName: 'Nyein-Chan-Resume.pdf', resumeUrl: SAMPLE_RESUME,
      skills: [
        { name: 'Kubernetes', proficiency: ProficiencyLevel.Expert },
        { name: 'GCP', proficiency: ProficiencyLevel.Advanced },
        { name: 'CI/CD', proficiency: ProficiencyLevel.Advanced },
      ],
      experiences: [
        { id: 1, companyName: 'Innotech', jobTitle: 'Cloud Engineer', startDate: '2020-08-01', currentJob: true },
      ],
      educations: [
        { id: 1, institution: 'Yangon Technological University', degree: 'B.E.', major: 'IT', graduationYear: 2018 },
      ],
      notes: [
        { id: 1, author: 'Thiri Aung', body: 'Strong infra background. Interview booked.', createdAt: '2026-06-06T05:00:00Z' },
      ],
      statusHistory: [
        { status: ApplicationStatus.Applied, changedAt: '2026-06-03T08:30:00Z' },
        { status: ApplicationStatus.Screening, changedAt: '2026-06-04T03:00:00Z' },
        { status: ApplicationStatus.Shortlisted, changedAt: '2026-06-05T06:00:00Z' },
        { status: ApplicationStatus.Interview, changedAt: '2026-06-06T05:00:00Z' },
      ],
      match: { jobId: 302, total: 86, skill: 90, experience: 85, location: 100, salary: 65, education: 80, calculatedAt: '2026-06-03T08:30:00Z' },
    },
  ],
};
