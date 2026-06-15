import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Layout is declared in AdminModule → relative import (not @layouts) to dodge TS-993004.
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/users/user-management.component';
import { CompanyManagementComponent } from './pages/companies/company-management.component';
import { AdminCompanyDetailComponent } from './pages/companies/admin-company-detail.component';
import { VerificationQueueComponent } from './pages/verifications/verification-queue.component';
import { SubscriptionOversightComponent } from './pages/subscriptions/subscription-oversight.component';
import { JobModerationComponent } from './pages/jobs/job-moderation.component';
import { FraudDashboardComponent } from './pages/fraud/fraud-dashboard.component';
import { SystemAnalyticsComponent } from './pages/analytics/system-analytics.component';
import { AuditLogComponent } from './pages/audit-logs/audit-log.component';
import { PlatformSettingsComponent } from './pages/settings/platform-settings.component';

/**
 * Platform-admin routes — all screens are live: dashboard (PA1.0), users
 * (PA1.1), companies (PA1.2), verification queue (PA1.3), job moderation (PA2.0),
 * fraud (PA2.1), system analytics (PA2.2), audit logs (PA2.3), platform settings
 * (PA2.4), and subscription oversight (PA3.0). No placeholders remain.
 */
const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent, title: 'Admin | Job Click' },
      { path: 'users', component: UserManagementComponent, title: 'Users | Job Click' },
      { path: 'users/:id', component: UserManagementComponent, title: 'User | Job Click' },
      { path: 'companies', component: CompanyManagementComponent, title: 'Companies | Job Click' },
      { path: 'companies/:id', component: AdminCompanyDetailComponent, title: 'Company | Job Click' },
      { path: 'verifications', component: VerificationQueueComponent, title: 'Verifications | Job Click' },
      { path: 'jobs', component: JobModerationComponent, title: 'Job Moderation | Job Click' },
      { path: 'fraud', component: FraudDashboardComponent, title: 'Fraud | Job Click' },
      { path: 'analytics', component: SystemAnalyticsComponent, title: 'System Analytics | Job Click' },
      { path: 'audit-logs', component: AuditLogComponent, title: 'Audit Logs | Job Click' },
      { path: 'settings', component: PlatformSettingsComponent, title: 'Settings | Job Click' },
      { path: 'subscriptions', component: SubscriptionOversightComponent, title: 'Subscriptions | Job Click' },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
