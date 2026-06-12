import { Id } from '@core/models/common.model';
import { SeniorityLevel } from '@core/enums/seniority-level.enum';
import { AvailabilityStatus } from '@core/enums/availability-status.enum';

/** A named collection of candidates (e.g. "Java Developers"). */
export interface TalentPool {
  id: Id;
  name: string;
  description?: string;
  candidateCount: number;
  createdAt: string;
}

/** A candidate saved into a pool (resolved from the candidate directory). */
export interface TalentPoolMember {
  candidateId: Id;
  fullName: string;
  headline?: string;
  location?: string;
  topSkills: string[];
  seniorityLevel: SeniorityLevel;
  availabilityStatus: AvailabilityStatus;
  addedAt: string;
}

export interface TalentPoolDetail extends TalentPool {
  members: TalentPoolMember[];
}

export interface TalentPoolFormValue {
  name: string;
  description?: string;
}
