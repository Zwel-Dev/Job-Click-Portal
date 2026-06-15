import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommsModule } from '@features/comms/comms.module';
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
import { AnalyticsViewComponent } from './components/analytics-view/analytics-view.component';
import { OverviewComponent } from './company-admin/pages/overview/overview.component';
import { CompanyProfileComponent } from './company-admin/pages/profile/company-profile.component';
import { CompanyInsightsComponent } from './company-admin/pages/insights/company-insights.component';
import { SubscriptionComponent } from './company-admin/pages/subscription/subscription.component';
import { PlanUsageCardComponent } from './company-admin/components/plan-usage-card/plan-usage-card.component';
import { CompanyLocationsComponent } from './company-admin/pages/locations/company-locations.component';
import { LocationFormDialogComponent } from './company-admin/components/location-form-dialog/location-form-dialog.component';
import { DepartmentsComponent } from './company-admin/pages/departments/departments.component';
import { DepartmentFormDialogComponent } from './company-admin/components/department-form-dialog/department-form-dialog.component';
import { VerificationCenterComponent } from './company-admin/pages/verification/verification-center.component';
import { TeamListComponent } from './company-admin/pages/team/team-list.component';
import { InviteMemberDialogComponent } from './company-admin/components/invite-member-dialog/invite-member-dialog.component';
import { TransferOwnershipDialogComponent } from './company-admin/components/transfer-ownership-dialog/transfer-ownership-dialog.component';

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
    AnalyticsViewComponent,
    OverviewComponent,
    CompanyProfileComponent,
    CompanyInsightsComponent,
    SubscriptionComponent,
    PlanUsageCardComponent,
    CompanyLocationsComponent,
    LocationFormDialogComponent,
    DepartmentsComponent,
    DepartmentFormDialogComponent,
    VerificationCenterComponent,
    TeamListComponent,
    InviteMemberDialogComponent,
    TransferOwnershipDialogComponent,
  ],
  imports: [SharedModule, CommsModule, EmployerRoutingModule],
})
export class EmployerModule {}
