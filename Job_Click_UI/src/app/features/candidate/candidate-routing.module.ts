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
import { ResumeManagerComponent } from './pages/resumes/resume-manager.component';
import { RecommendationsComponent } from './pages/recommendations/recommendations.component';
// Notifications + messages pages are declared in CommsModule (imported by CandidateModule).
import { NotificationListComponent } from '@features/comms/pages/notifications/notification-list.component';
import { NotificationPreferencesComponent } from '@features/comms/pages/notification-preferences/notification-preferences.component';
import { MessagesPageComponent } from '@features/comms/pages/messages/messages-page.component';

const routes: Routes = [
  {
    path: '',
    component: CandidateLayoutComponent,
    children: [
      { path: 'dashboard', component: CandidateDashboardComponent, title: 'Dashboard | Job Click' },
      { path: 'profile', component: ProfileShellComponent, title: 'My Profile | Job Click' },
      { path: 'resumes', component: ResumeManagerComponent, title: 'Resumes | Job Click' },
      { path: 'jobs', component: JobSearchComponent, title: 'Find Jobs | Job Click' },
      { path: 'jobs/:id', component: JobDetailComponent, title: 'Job Details | Job Click' },
      { path: 'saved-jobs', component: SavedJobsComponent, title: 'Saved Jobs | Job Click' },
      { path: 'recommendations', component: RecommendationsComponent, title: 'Recommended | Job Click' },
      { path: 'applications', component: ApplicationListComponent, title: 'Applications | Job Click' },
      { path: 'applications/:id', component: ApplicationDetailComponent, title: 'Application | Job Click' },
      { path: 'messages', component: MessagesPageComponent, title: 'Messages | Job Click' },
      { path: 'notifications', component: NotificationListComponent, title: 'Notifications | Job Click' },
      { path: 'notifications/preferences', component: NotificationPreferencesComponent, title: 'Notification Preferences | Job Click' },
      { path: 'settings', component: AccountSettingsComponent, title: 'Settings | Job Click' },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateRoutingModule {}
