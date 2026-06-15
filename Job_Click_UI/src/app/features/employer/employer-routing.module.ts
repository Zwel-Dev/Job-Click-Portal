import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Layout + dashboard are declared in EmployerModule → relative imports (TS-993004).
import { EmployerLayoutComponent } from '../../layouts/employer-layout/employer-layout.component';
import { EmployerDashboardComponent } from './pages/dashboard/employer-dashboard.component';
import { JobListComponent } from './pages/jobs/job-list.component';
import { JobWizardComponent } from './pages/jobs/job-wizard.component';
import { EmployerJobDetailComponent } from './pages/jobs/job-detail.component';
import { JobApprovalQueueComponent } from './pages/approvals/job-approval-queue.component';
import { PipelineBoardComponent } from './pages/pipeline/pipeline-board.component';
import { ApplicantDetailComponent } from './pages/pipeline/applicant-detail.component';
import { OfferListComponent } from './pages/offers/offer-list.component';
import { CandidateSearchComponent } from './pages/candidates/candidate-search.component';
import { TalentPoolListComponent } from './pages/talent-pools/talent-pool-list.component';
import { TalentPoolDetailComponent } from './pages/talent-pools/talent-pool-detail.component';
import { RecruitmentAnalyticsComponent } from './pages/analytics/recruitment-analytics.component';
import { OverviewComponent } from './company-admin/pages/overview/overview.component';
import { CompanyProfileComponent } from './company-admin/pages/profile/company-profile.component';
import { CompanyLocationsComponent } from './company-admin/pages/locations/company-locations.component';
import { DepartmentsComponent } from './company-admin/pages/departments/departments.component';
import { VerificationCenterComponent } from './company-admin/pages/verification/verification-center.component';
import { TeamListComponent } from './company-admin/pages/team/team-list.component';
import { CompanyInsightsComponent } from './company-admin/pages/insights/company-insights.component';
import { SubscriptionComponent } from './company-admin/pages/subscription/subscription.component';
import { NotificationListComponent } from '@features/comms/pages/notifications/notification-list.component';
import { NotificationPreferencesComponent } from '@features/comms/pages/notification-preferences/notification-preferences.component';
import { MessagesPageComponent } from '@features/comms/pages/messages/messages-page.component';
import { recruiterGuard } from '@core/auth/guards/recruiter.guard';
import { managerGuard } from '@core/auth/guards/manager.guard';
import { companyAdminGuard } from '@core/auth/guards/company-admin.guard';
import { planLimitGuard } from '@core/auth/guards/plan-limit.guard';
import { unsavedChangesGuard } from '@core/guards/unsaved-changes.guard';

const routes: Routes = [
  {
    path: '',
    component: EmployerLayoutComponent,
    children: [
      { path: 'dashboard', component: EmployerDashboardComponent, title: 'Dashboard | Job Click' },
      { path: 'jobs', component: JobListComponent, title: 'Jobs | Job Click' },
      { path: 'jobs/new', component: JobWizardComponent, canActivate: [recruiterGuard, planLimitGuard], title: 'Create Job | Job Click' },
      { path: 'jobs/:id/applicants', component: PipelineBoardComponent, canActivate: [recruiterGuard], title: 'Applicants | Job Click' },
      { path: 'jobs/:id/edit', component: JobWizardComponent, canActivate: [recruiterGuard], title: 'Edit Job | Job Click' },
      { path: 'jobs/:id', component: EmployerJobDetailComponent, title: 'Job | Job Click' },
      { path: 'applications/:id', component: ApplicantDetailComponent, canActivate: [recruiterGuard], title: 'Applicant | Job Click' },
      { path: 'approvals', component: JobApprovalQueueComponent, canActivate: [managerGuard], title: 'Approvals | Job Click' },
      { path: 'candidates', component: CandidateSearchComponent, canActivate: [recruiterGuard], title: 'Candidates | Job Click' },
      { path: 'talent-pools', component: TalentPoolListComponent, canActivate: [recruiterGuard], title: 'Talent Pools | Job Click' },
      { path: 'talent-pools/:id', component: TalentPoolDetailComponent, canActivate: [recruiterGuard], title: 'Talent Pool | Job Click' },
      { path: 'offers', component: OfferListComponent, canActivate: [recruiterGuard], title: 'Offers | Job Click' },
      { path: 'analytics', component: RecruitmentAnalyticsComponent, canActivate: [managerGuard], title: 'Analytics | Job Click' },
      // Company administration (Company Admin area — CA1.0 ships the overview; deeper screens land in CA1.1+)
      { path: 'company', component: OverviewComponent, canActivate: [companyAdminGuard], title: 'Company | Job Click' },
      { path: 'company/profile', component: CompanyProfileComponent, canActivate: [companyAdminGuard], canDeactivate: [unsavedChangesGuard], title: 'Company Profile | Job Click' },
      { path: 'company/locations', component: CompanyLocationsComponent, canActivate: [companyAdminGuard], title: 'Locations | Job Click' },
      { path: 'company/departments', component: DepartmentsComponent, canActivate: [managerGuard], title: 'Departments | Job Click' },
      { path: 'company/verification', component: VerificationCenterComponent, canActivate: [companyAdminGuard], title: 'Verification | Job Click' },
      { path: 'company/insights', component: CompanyInsightsComponent, canActivate: [managerGuard], title: 'Company Insights | Job Click' },
      { path: 'team', component: TeamListComponent, canActivate: [companyAdminGuard], title: 'Team | Job Click' },
      { path: 'subscription', component: SubscriptionComponent, canActivate: [companyAdminGuard], title: 'Subscription | Job Click' },
      { path: 'messages', component: MessagesPageComponent, title: 'Messages | Job Click' },
      { path: 'notifications', component: NotificationListComponent, title: 'Notifications | Job Click' },
      { path: 'notifications/preferences', component: NotificationPreferencesComponent, title: 'Notification Preferences | Job Click' },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployerRoutingModule {}
