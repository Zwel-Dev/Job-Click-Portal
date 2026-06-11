import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { LogoComponent } from './components/logo/logo.component';
import { PasswordStrengthComponent } from './components/password-strength/password-strength.component';

/** Reusable presentational components exported to every feature module. */
const SHARED_COMPONENTS = [LogoComponent, PasswordStrengthComponent];

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
