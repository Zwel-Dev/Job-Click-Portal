import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { EmployerRoutingModule } from './employer-routing.module';
// Layout component class imported via RELATIVE path (not @layouts) — TS-993004.
import { EmployerLayoutComponent } from '../../layouts/employer-layout/employer-layout.component';
import { EmployerDashboardComponent } from './pages/dashboard/employer-dashboard.component';
import { JobListComponent } from './pages/jobs/job-list.component';
import { JobWizardComponent } from './pages/jobs/job-wizard.component';
import { EmployerJobDetailComponent } from './pages/jobs/job-detail.component';
import { JobApprovalQueueComponent } from './pages/approvals/job-approval-queue.component';
import { PipelineBoardComponent } from './pages/pipeline/pipeline-board.component';
import { ApplicantDetailComponent } from './pages/pipeline/applicant-detail.component';
import { AssessmentFormComponent } from './pages/pipeline/assessment-form.component';
import { OfferListComponent } from './pages/offers/offer-list.component';
import { OfferFormComponent } from './pages/offers/offer-form.component';
import { CandidateSearchComponent } from './pages/candidates/candidate-search.component';
import { TalentPoolListComponent } from './pages/talent-pools/talent-pool-list.component';
import { TalentPoolDetailComponent } from './pages/talent-pools/talent-pool-detail.component';
import { TalentPoolFormComponent } from './pages/talent-pools/talent-pool-form.component';
import { AddToPoolDialogComponent } from './pages/talent-pools/add-to-pool-dialog.component';
import { RecruitmentAnalyticsComponent } from './pages/analytics/recruitment-analytics.component';
import { ScreeningQuestionsEditorComponent } from './components/screening-questions-editor/screening-questions-editor.component';

@NgModule({
  declarations: [
    EmployerLayoutComponent,
    EmployerDashboardComponent,
    JobListComponent,
    JobWizardComponent,
    EmployerJobDetailComponent,
    JobApprovalQueueComponent,
    PipelineBoardComponent,
    ApplicantDetailComponent,
    AssessmentFormComponent,
    OfferListComponent,
    OfferFormComponent,
    CandidateSearchComponent,
    TalentPoolListComponent,
    TalentPoolDetailComponent,
    TalentPoolFormComponent,
    AddToPoolDialogComponent,
    RecruitmentAnalyticsComponent,
    ScreeningQuestionsEditorComponent,
  ],
  imports: [SharedModule, EmployerRoutingModule],
})
export class EmployerModule {}
