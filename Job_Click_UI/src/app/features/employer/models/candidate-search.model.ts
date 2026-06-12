import { Id } from '@core/models/common.model';
import { SeniorityLevel } from '@core/enums/seniority-level.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { AvailabilityStatus } from '@core/enums/availability-status.enum';
import { ProfileVisibility } from '@core/enums/profile-visibility.enum';

export type CandidateSortOption = 'recent' | 'experience' | 'name';

/** A discoverable candidate as shown in the employer talent search. */
export interface CandidateSearchResult {
  candidateId: Id;
  fullName: string;
  headline?: string;
  location?: string;
  avatarUrl?: string;
  topSkills: string[];
  yearsExperience: number;
  seniorityLevel: SeniorityLevel;
  availabilityStatus: AvailabilityStatus;
  workMode?: WorkMode;
  expectedSalary?: number;
  currency?: string;
  /** Discoverability — Private profiles are never returned to recruiters. */
  visibility: ProfileVisibility;
  updatedAt: string;
}

/** Filter/sort/page parameters for the candidate search. */
export interface CandidateSearchQuery {
  keyword?: string;
  location?: string;
  seniorityLevels?: SeniorityLevel[];
  availability?: AvailabilityStatus[];
  remoteOnly?: boolean;
  sort: CandidateSortOption;
  page: number;
  pageSize: number;
}
