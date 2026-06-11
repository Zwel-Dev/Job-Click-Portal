import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CandidateCertification,
  CandidateEducation,
  CandidateExperience,
  CandidatePortfolio,
  CandidateProfile,
  CandidateSkill,
} from '@core/models/candidate.model';
import { ApiError, Id } from '@core/models/common.model';
import { computeProfileCompletion } from '@core/utils/profile-completion';
import { CandidateProfileService } from '../services/candidate-profile.service';

/** Signal store: candidate profile + sub-collections, with live completion. */
@Injectable({ providedIn: 'root' })
export class CandidateProfileStore {
  private readonly service = inject(CandidateProfileService);

  private readonly profileState = signal<CandidateProfile | null>(null);
  private readonly skillsState = signal<CandidateSkill[]>([]);
  private readonly experiencesState = signal<CandidateExperience[]>([]);
  private readonly educationsState = signal<CandidateEducation[]>([]);
  private readonly certificationsState = signal<CandidateCertification[]>([]);
  private readonly portfoliosState = signal<CandidatePortfolio[]>([]);
  private readonly loadingState = signal(false);
  private readonly loadedState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly profile = this.profileState.asReadonly();
  readonly skills = this.skillsState.asReadonly();
  readonly experiences = this.experiencesState.asReadonly();
  readonly educations = this.educationsState.asReadonly();
  readonly certifications = this.certificationsState.asReadonly();
  readonly portfolios = this.portfoliosState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  readonly completion = computed(() => {
    const profile = this.profileState();
    if (!profile) {
      return 0;
    }
    return computeProfileCompletion(profile, {
      skills: this.skillsState(),
      experiences: this.experiencesState(),
      educations: this.educationsState(),
      certifications: this.certificationsState(),
      portfolios: this.portfoliosState(),
    });
  });

  /** Refined in C1.4 (apply flow) to also require a verified email + a resume. */
  readonly isApplyReady = computed(() => this.profileState() !== null);

  load(force = false): void {
    if (this.loadingState() || (this.loadedState() && !force)) {
      return;
    }
    this.loadingState.set(true);
    this.errorState.set(null);

    forkJoin({
      profile: this.service.getProfile(),
      skills: this.service.getSkills(),
      experiences: this.service.getExperiences(),
      educations: this.service.getEducations(),
      certifications: this.service.getCertifications(),
      portfolios: this.service.getPortfolios(),
    }).subscribe({
      next: (data) => {
        this.profileState.set(data.profile);
        this.skillsState.set(data.skills);
        this.experiencesState.set(data.experiences);
        this.educationsState.set(data.educations);
        this.certificationsState.set(data.certifications);
        this.portfoliosState.set(data.portfolios);
        this.loadingState.set(false);
        this.loadedState.set(true);
      },
      error: (error: ApiError) => {
        this.errorState.set(error.message ?? 'Failed to load your profile.');
        this.loadingState.set(false);
      },
    });
  }

  // --- Profile --------------------------------------------------------------
  saveProfile(patch: Partial<CandidateProfile>): Observable<CandidateProfile> {
    return this.service.updateProfile(patch).pipe(tap((profile) => this.profileState.set(profile)));
  }

  // --- Skills ---------------------------------------------------------------
  addSkill(input: Omit<CandidateSkill, 'id'>): Observable<CandidateSkill> {
    return this.service.addSkill(input).pipe(tap((item) => this.skillsState.update((list) => [...list, item])));
  }
  updateSkill(id: Id, input: Omit<CandidateSkill, 'id'>): Observable<CandidateSkill> {
    return this.service
      .updateSkill(id, input)
      .pipe(tap((item) => this.skillsState.update((list) => list.map((x) => (x.id === id ? item : x)))));
  }
  removeSkill(id: Id): Observable<void> {
    return this.service.removeSkill(id).pipe(tap(() => this.skillsState.update((list) => list.filter((x) => x.id !== id))));
  }

  // --- Experiences ----------------------------------------------------------
  addExperience(input: Omit<CandidateExperience, 'id'>): Observable<CandidateExperience> {
    return this.service.addExperience(input).pipe(tap((item) => this.experiencesState.update((list) => [...list, item])));
  }
  updateExperience(id: Id, input: Omit<CandidateExperience, 'id'>): Observable<CandidateExperience> {
    return this.service
      .updateExperience(id, input)
      .pipe(tap((item) => this.experiencesState.update((list) => list.map((x) => (x.id === id ? item : x)))));
  }
  removeExperience(id: Id): Observable<void> {
    return this.service.removeExperience(id).pipe(tap(() => this.experiencesState.update((list) => list.filter((x) => x.id !== id))));
  }

  // --- Educations -----------------------------------------------------------
  addEducation(input: Omit<CandidateEducation, 'id'>): Observable<CandidateEducation> {
    return this.service.addEducation(input).pipe(tap((item) => this.educationsState.update((list) => [...list, item])));
  }
  updateEducation(id: Id, input: Omit<CandidateEducation, 'id'>): Observable<CandidateEducation> {
    return this.service
      .updateEducation(id, input)
      .pipe(tap((item) => this.educationsState.update((list) => list.map((x) => (x.id === id ? item : x)))));
  }
  removeEducation(id: Id): Observable<void> {
    return this.service.removeEducation(id).pipe(tap(() => this.educationsState.update((list) => list.filter((x) => x.id !== id))));
  }

  // --- Certifications -------------------------------------------------------
  addCertification(input: Omit<CandidateCertification, 'id'>): Observable<CandidateCertification> {
    return this.service.addCertification(input).pipe(tap((item) => this.certificationsState.update((list) => [...list, item])));
  }
  updateCertification(id: Id, input: Omit<CandidateCertification, 'id'>): Observable<CandidateCertification> {
    return this.service
      .updateCertification(id, input)
      .pipe(tap((item) => this.certificationsState.update((list) => list.map((x) => (x.id === id ? item : x)))));
  }
  removeCertification(id: Id): Observable<void> {
    return this.service.removeCertification(id).pipe(tap(() => this.certificationsState.update((list) => list.filter((x) => x.id !== id))));
  }

  // --- Portfolios -----------------------------------------------------------
  addPortfolio(input: Omit<CandidatePortfolio, 'id'>): Observable<CandidatePortfolio> {
    return this.service.addPortfolio(input).pipe(tap((item) => this.portfoliosState.update((list) => [...list, item])));
  }
  updatePortfolio(id: Id, input: Omit<CandidatePortfolio, 'id'>): Observable<CandidatePortfolio> {
    return this.service
      .updatePortfolio(id, input)
      .pipe(tap((item) => this.portfoliosState.update((list) => list.map((x) => (x.id === id ? item : x)))));
  }
  removePortfolio(id: Id): Observable<void> {
    return this.service.removePortfolio(id).pipe(tap(() => this.portfoliosState.update((list) => list.filter((x) => x.id !== id))));
  }

  clear(): void {
    this.profileState.set(null);
    this.skillsState.set([]);
    this.experiencesState.set([]);
    this.educationsState.set([]);
    this.certificationsState.set([]);
    this.portfoliosState.set([]);
    this.loadedState.set(false);
    this.errorState.set(null);
  }
}
