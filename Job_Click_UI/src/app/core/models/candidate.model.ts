import { Id } from './common.model';
import { EmploymentType } from '@core/enums/employment-type.enum';
import { WorkMode } from '@core/enums/work-mode.enum';
import { AvailabilityStatus } from '@core/enums/availability-status.enum';
import { ProficiencyLevel } from '@core/enums/proficiency-level.enum';
import { ProfileVisibility } from '@core/enums/profile-visibility.enum';
import { PortfolioPlatform } from '@core/enums/portfolio-platform.enum';

/** Candidate profile (composed from USERS + CANDIDATE_PROFILES for the UI). */
export interface CandidateProfile {
  id: Id;
  userId: Id;
  // Personal
  fullName: string;
  email: string;
  phone?: string;
  profilePhotoUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  // Professional
  headline?: string;
  summary?: string;
  careerObjective?: string;
  // Preferences
  preferredJobTitles: string[];
  preferredLocations: string[];
  employmentTypes: EmploymentType[];
  workMode?: WorkMode;
  expectedSalary?: number;
  currency?: string;
  availabilityStatus: AvailabilityStatus;
  profileVisibility: ProfileVisibility;
  /** 0-100, server-authoritative. */
  profileCompletion: number;
  updatedAt?: string;
}

export interface CandidateSkill {
  id: Id;
  skillId: Id;
  name: string;
  category?: string;
  proficiency: ProficiencyLevel;
  yearsExperience: number;
}

export interface CandidateExperience {
  id: Id;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  currentJob: boolean;
  responsibilities?: string;
  achievements?: string;
}

export interface CandidateEducation {
  id: Id;
  institution: string;
  degree: string;
  major: string;
  gpa?: number;
  graduationYear: number;
}

export interface CandidateCertification {
  id: Id;
  certificationName: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface CandidatePortfolio {
  id: Id;
  platform: PortfolioPlatform;
  url: string;
}

export interface Resume {
  id: Id;
  fileName: string;
  fileUrl: string;
  sizeBytes: number;
  isDefault: boolean;
  uploadedAt: string;
}
