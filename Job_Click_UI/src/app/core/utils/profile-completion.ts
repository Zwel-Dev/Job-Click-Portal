import {
  CandidateCertification,
  CandidateEducation,
  CandidateExperience,
  CandidatePortfolio,
  CandidateProfile,
  CandidateSkill,
} from '@core/models/candidate.model';

export interface ProfileCollections {
  skills: CandidateSkill[];
  experiences: CandidateExperience[];
  educations: CandidateEducation[];
  certifications: CandidateCertification[];
  portfolios: CandidatePortfolio[];
}

/**
 * Client-side profile completion (0-100) for instant feedback after edits.
 * Weighted by section; the server value remains authoritative on reload.
 */
export function computeProfileCompletion(
  profile: CandidateProfile,
  collections: ProfileCollections,
): number {
  const checks: ReadonlyArray<readonly [boolean, number]> = [
    [
      Boolean(profile.fullName && profile.phone && profile.dateOfBirth && profile.nationality && profile.address),
      15,
    ],
    [Boolean(profile.headline && profile.summary), 15],
    [
      Boolean(
        profile.preferredJobTitles.length &&
          profile.preferredLocations.length &&
          profile.employmentTypes.length &&
          profile.expectedSalary,
      ),
      15,
    ],
    [collections.experiences.length > 0, 20],
    [collections.educations.length > 0, 15],
    [collections.skills.length >= 3, 15],
    [collections.certifications.length > 0, 3],
    [collections.portfolios.length > 0, 2],
  ];

  const score = checks.reduce((sum, [met, weight]) => sum + (met ? weight : 0), 0);
  return Math.min(100, Math.round(score));
}
