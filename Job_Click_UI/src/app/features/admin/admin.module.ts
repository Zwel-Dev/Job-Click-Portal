import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
// Layout component class imported via RELATIVE path (not @layouts) — TS-993004.
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/users/user-management.component';
import { UserDetailDrawerComponent } from './components/user-detail-drawer/user-detail-drawer.component';
import { CompanyManagementComponent } from './pages/companies/company-management.component';
import { AdminCompanyDetailComponent } from './pages/companies/admin-company-detail.component';
import { VerificationQueueComponent } from './pages/verifications/verification-queue.component';
import { VerificationReviewPanelComponent } from './components/verification-review-panel/verification-review-panel.component';
import { SubscriptionOversightComponent } from './pages/subscriptions/subscription-oversight.component';
import { CompanyPaymentsDialogComponent } from './components/company-payments-dialog/company-payments-dialog.component';
import { JobModerationComponent } from './pages/jobs/job-moderation.component';
import { FlagJobDialogComponent } from './components/flag-job-dialog/flag-job-dialog.component';
import { FraudDashboardComponent } from './pages/fraud/fraud-dashboard.component';
import { FraudSignalCardComponent } from './components/fraud-signal-card/fraud-signal-card.component';
import { SystemAnalyticsComponent } from './pages/analytics/system-analytics.component';
import { AuditLogComponent } from './pages/audit-logs/audit-log.component';
import { PlatformSettingsComponent } from './pages/settings/platform-settings.component';
import { SkillFormDialogComponent } from './components/skill-form-dialog/skill-form-dialog.component';
import { PlanFormDialogComponent } from './components/plan-form-dialog/plan-form-dialog.component';

/**
 * Platform-admin workspace (lazy-loaded at `/admin`). PA1.0: shell + dashboard.
 * PA1.1: users. PA1.2: companies. PA1.3: verification queue + review.
 * PA2.0: job moderation. PA2.1: fraud detection. PA2.2: system analytics.
 * PA2.3: audit logs. PA2.4: platform settings. PA3.0: subscription oversight.
 */
@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardComponent,
    UserManagementComponent,
    UserDetailDrawerComponent,
    CompanyManagementComponent,
    AdminCompanyDetailComponent,
    VerificationQueueComponent,
    VerificationReviewPanelComponent,
    SubscriptionOversightComponent,
    CompanyPaymentsDialogComponent,
    JobModerationComponent,
    FlagJobDialogComponent,
    FraudDashboardComponent,
    FraudSignalCardComponent,
    SystemAnalyticsComponent,
    AuditLogComponent,
    PlatformSettingsComponent,
    SkillFormDialogComponent,
    PlanFormDialogComponent,
  ],
  imports: [SharedModule, AdminRoutingModule],
})
export class AdminModule {}
