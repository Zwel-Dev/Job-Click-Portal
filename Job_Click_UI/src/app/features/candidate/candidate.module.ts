import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CandidateRoutingModule } from './candidate-routing.module';
// Layout component class imported via RELATIVE path (not @layouts) — TS-993004.
import { CandidateLayoutComponent } from '../../layouts/candidate-layout/candidate-layout.component';
import { CandidateDashboardComponent } from './pages/dashboard/candidate-dashboard.component';
import { JobSearchComponent } from './pages/jobs/job-search.component';
import { JobDetailComponent } from './pages/jobs/job-detail.component';
import { ApplyDialogComponent } from './pages/jobs/apply-dialog/apply-dialog.component';
import { SavedJobsComponent } from './pages/saved-jobs/saved-jobs.component';
import { ApplicationListComponent } from './pages/applications/application-list.component';
import { ApplicationDetailComponent } from './pages/applications/application-detail.component';
import { AccountSettingsComponent } from './pages/settings/account-settings.component';
import { ResumeManagerComponent } from './pages/resumes/resume-manager.component';
import { ResumePreviewDialogComponent } from './pages/resumes/resume-preview-dialog.component';
import { RecommendationsComponent } from './pages/recommendations/recommendations.component';
import { RecommendationCardComponent } from './components/recommendation-card/recommendation-card.component';
import { ProfileShellComponent } from './pages/profile/profile-shell.component';
import { PersonalInfoSectionComponent } from './pages/profile/sections/personal-info-section.component';
import { ProfessionalSummarySectionComponent } from './pages/profile/sections/professional-summary-section.component';
import { EmploymentPreferencesSectionComponent } from './pages/profile/sections/employment-preferences-section.component';
import { WorkExperienceSectionComponent } from './pages/profile/sections/work-experience-section.component';
import { EducationSectionComponent } from './pages/profile/sections/education-section.component';
import { SkillsSectionComponent } from './pages/profile/sections/skills-section.component';
import { CertificationsSectionComponent } from './pages/profile/sections/certifications-section.component';
import { PortfolioSectionComponent } from './pages/profile/sections/portfolio-section.component';

@NgModule({
  declarations: [
    CandidateLayoutComponent,
    CandidateDashboardComponent,
    JobSearchComponent,
    JobDetailComponent,
    ApplyDialogComponent,
    SavedJobsComponent,
    ApplicationListComponent,
    ApplicationDetailComponent,
    AccountSettingsComponent,
    ResumeManagerComponent,
    ResumePreviewDialogComponent,
    RecommendationsComponent,
    RecommendationCardComponent,
    ProfileShellComponent,
    PersonalInfoSectionComponent,
    ProfessionalSummarySectionComponent,
    EmploymentPreferencesSectionComponent,
    WorkExperienceSectionComponent,
    EducationSectionComponent,
    SkillsSectionComponent,
    CertificationsSectionComponent,
    PortfolioSectionComponent,
  ],
  imports: [SharedModule, CandidateRoutingModule],
})
export class CandidateModule {}
