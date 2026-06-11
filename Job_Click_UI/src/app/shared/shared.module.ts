import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { LogoComponent } from './components/logo/logo.component';
import { PasswordStrengthComponent } from './components/password-strength/password-strength.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ErrorStateComponent } from './components/error-state/error-state.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ApplicationStatusChipComponent } from './components/application-status-chip/application-status-chip.component';
import { JobCardComponent } from './components/job-card/job-card.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ApplicationStatusTrackerComponent } from './components/application-status-tracker/application-status-tracker.component';

/** Reusable presentational components exported to every feature module. */
const SHARED_COMPONENTS = [
  LogoComponent,
  PasswordStrengthComponent,
  PageHeaderComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  SkeletonComponent,
  KpiCardComponent,
  ComingSoonComponent,
  ConfirmDialogComponent,
  ApplicationStatusChipComponent,
  JobCardComponent,
  PaginationComponent,
  ApplicationStatusTrackerComponent,
];

/**
 * Shared module: re-exports the common Angular + Material building blocks and
 * the reusable presentational component library. Imported by every feature
 * module. Must not provide stateful services.
 */
@NgModule({
  declarations: [SHARED_COMPONENTS],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule],
  exports: [
    SHARED_COMPONENTS,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
  ],
})
export class SharedModule {}
