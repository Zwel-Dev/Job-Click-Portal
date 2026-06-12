import { SeniorityLevel } from '@core/enums/seniority-level.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { AvailabilityStatus } from '@core/enums/availability-status.enum';
import { ProfileVisibility } from '@core/enums/profile-visibility.enum';
import { CandidateSearchResult } from '../../models/candidate-search.model';

/**
 * Discoverable candidate pool for the employer talent search. Includes one
 * Private profile (id 1210) that the service must exclude from results.
 */
export const MOCK_TALENT_POOL: CandidateSearchResult[] = [
  {
    candidateId: 1201, fullName: 'Hsu Yadanar', headline: 'Senior Angular Developer',
    location: 'Yangon, Myanmar', topSkills: ['Angular', 'TypeScript', 'RxJS', 'NgRx'],
    yearsExperience: 6, seniorityLevel: SeniorityLevel.Senior, availabilityStatus: AvailabilityStatus.OpenToWork,
    workMode: WorkMode.Hybrid, expectedSalary: 3_200_000, currency: 'MMK',
    visibility: ProfileVisibility.Public, updatedAt: '2026-06-10T08:00:00Z',
  },
  {
    candidateId: 1202, fullName: 'Kaung Myat', headline: 'Full-stack Engineer · Node & React',
    location: 'Yangon, Myanmar', topSkills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    yearsExperience: 5, seniorityLevel: SeniorityLevel.Mid, availabilityStatus: AvailabilityStatus.Employed,
    workMode: WorkMode.Remote, expectedSalary: 2_800_000, currency: 'MMK',
    visibility: ProfileVisibility.RecruitersOnly, updatedAt: '2026-06-09T10:30:00Z',
  },
  {
    candidateId: 1203, fullName: 'Thiri Win', headline: 'Product Designer (UI/UX)',
    location: 'Mandalay, Myanmar', topSkills: ['Figma', 'Design Systems', 'Prototyping'],
    yearsExperience: 4, seniorityLevel: SeniorityLevel.Mid, availabilityStatus: AvailabilityStatus.OpenToWork,
    workMode: WorkMode.Remote, expectedSalary: 2_400_000, currency: 'MMK',
    visibility: ProfileVisibility.Public, updatedAt: '2026-06-11T06:15:00Z',
  },
  {
    candidateId: 1204, fullName: 'Zin Mar Aung', headline: 'DevOps Engineer',
    location: 'Yangon, Myanmar', topSkills: ['Kubernetes', 'Docker', 'Terraform', 'AWS'],
    yearsExperience: 7, seniorityLevel: SeniorityLevel.Senior, availabilityStatus: AvailabilityStatus.OpenToWork,
    workMode: WorkMode.Onsite, expectedSalary: 3_500_000, currency: 'MMK',
    visibility: ProfileVisibility.RecruitersOnly, updatedAt: '2026-06-08T12:00:00Z',
  },
  {
    candidateId: 1205, fullName: 'Phyo Wai Yan', headline: 'Junior Frontend Developer',
    location: 'Yangon, Myanmar', topSkills: ['JavaScript', 'Vue', 'CSS'],
    yearsExperience: 2, seniorityLevel: SeniorityLevel.Junior, availabilityStatus: AvailabilityStatus.OpenToWork,
    workMode: WorkMode.Hybrid, expectedSalary: 1_400_000, currency: 'MMK',
    visibility: ProfileVisibility.Public, updatedAt: '2026-06-07T09:45:00Z',
  },
  {
    candidateId: 1206, fullName: 'Nanda Kyaw', headline: 'Backend Engineer · Java/Spring',
    location: 'Naypyidaw, Myanmar', topSkills: ['Java', 'Spring Boot', 'SQL', 'Microservices'],
    yearsExperience: 8, seniorityLevel: SeniorityLevel.Lead, availabilityStatus: AvailabilityStatus.NotLooking,
    workMode: WorkMode.Onsite, expectedSalary: 4_000_000, currency: 'MMK',
    visibility: ProfileVisibility.RecruitersOnly, updatedAt: '2026-05-30T14:20:00Z',
  },
  {
    candidateId: 1207, fullName: 'Ei Thandar', headline: 'Data Engineer',
    location: 'Remote', topSkills: ['Python', 'SQL', 'Airflow', 'Spark'],
    yearsExperience: 5, seniorityLevel: SeniorityLevel.Mid, availabilityStatus: AvailabilityStatus.OpenToWork,
    workMode: WorkMode.Remote, expectedSalary: 3_000_000, currency: 'MMK',
    visibility: ProfileVisibility.Public, updatedAt: '2026-06-11T11:00:00Z',
  },
  {
    candidateId: 1208, fullName: 'Wunna Tun', headline: 'QA Automation Engineer',
    location: 'Yangon, Myanmar', topSkills: ['Cypress', 'Playwright', 'TypeScript'],
    yearsExperience: 4, seniorityLevel: SeniorityLevel.Mid, availabilityStatus: AvailabilityStatus.Employed,
    workMode: WorkMode.Hybrid, expectedSalary: 2_200_000, currency: 'MMK',
    visibility: ProfileVisibility.Public, updatedAt: '2026-06-05T08:30:00Z',
  },
  {
    candidateId: 1209, fullName: 'Su Lae Phyu', headline: 'Engineering Manager',
    location: 'Yangon, Myanmar', topSkills: ['Leadership', 'Agile', 'System Design'],
    yearsExperience: 11, seniorityLevel: SeniorityLevel.Manager, availabilityStatus: AvailabilityStatus.OpenToWork,
    workMode: WorkMode.Hybrid, expectedSalary: 5_500_000, currency: 'MMK',
    visibility: ProfileVisibility.RecruitersOnly, updatedAt: '2026-06-06T15:00:00Z',
  },
  {
    candidateId: 1210, fullName: 'Aye Chan', headline: 'Mobile Developer (Flutter)',
    location: 'Yangon, Myanmar', topSkills: ['Flutter', 'Dart', 'Firebase'],
    yearsExperience: 3, seniorityLevel: SeniorityLevel.Mid, availabilityStatus: AvailabilityStatus.OpenToWork,
    workMode: WorkMode.Remote, expectedSalary: 2_000_000, currency: 'MMK',
    visibility: ProfileVisibility.Private, updatedAt: '2026-06-10T07:00:00Z',
  },
];
