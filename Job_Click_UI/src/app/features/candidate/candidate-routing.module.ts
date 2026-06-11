import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Layout + dashboard are declared in CandidateModule → relative imports (TS-993004).
import { CandidateLayoutComponent } from '../../layouts/candidate-layout/candidate-layout.component';
import { CandidateDashboardComponent } from './pages/dashboard/candidate-dashboard.component';
import { ProfileShellComponent } from './pages/profile/profile-shell.component';
import { JobSearchComponent } from './pages/jobs/job-search.component';
import { JobDetailComponent } from './pages/jobs/job-detail.component';
import { SavedJobsComponent } from './pages/saved-jobs/saved-jobs.component';
import { ApplicationListComponent } from './pages/applications/application-list.component';
import { ApplicationDetailComponent } from './pages/applications/application-detail.component';
import { AccountSettingsComponent } from './pages/settings/account-settings.component';
// ComingSoonComponent is declared in SharedModule → used here only as a route target.
import { ComingSoonComponent } from '@shared/components/coming-soon/coming-soon.component';

const routes: Routes = [
  {
    path: '',
    component: CandidateLayoutComponent,
    children: [
      { path: 'dashboard', component: CandidateDashboardComponent, title: 'Dashboard | Job Click' },
      { path: 'profile', component: ProfileShellComponent, title: 'My Profile | Job Click' },
      { path: 'resumes', component: ComingSoonComponent, data: { label: 'Resumes' }, title: 'Resumes | Job Click' },
      { path: 'jobs', component: JobSearchComponent, title: 'Find Jobs | Job Click' },
      { path: 'jobs/:id', component: JobDetailComponent, title: 'Job Details | Job Click' },
      { path: 'saved-jobs', component: SavedJobsComponent, title: 'Saved Jobs | Job Click' },
      { path: 'recommendations', component: ComingSoonComponent, data: { label: 'Recommendations' }, title: 'Recommendations | Job Click' },
      { path: 'applications', component: ApplicationListComponent, title: 'Applications | Job Click' },
      { path: 'applications/:id', component: ApplicationDetailComponent, title: 'Application | Job Click' },
      { path: 'interviews', component: ComingSoonComponent, data: { label: 'Interviews' }, title: 'Interviews | Job Click' },
      { path: 'messages', component: ComingSoonComponent, data: { label: 'Messages' }, title: 'Messages | Job Click' },
      { path: 'notifications', component: ComingSoonComponent, data: { label: 'Notifications' }, title: 'Notifications | Job Click' },
      { path: 'settings', component: AccountSettingsComponent, title: 'Settings | Job Click' },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateRoutingModule {}
