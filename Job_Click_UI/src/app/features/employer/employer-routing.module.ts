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
import { recruiterGuard } from '@core/auth/guards/recruiter.guard';
import { managerGuard } from '@core/auth/guards/manager.guard';
import { planLimitGuard } from '@core/auth/guards/plan-limit.guard';

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
