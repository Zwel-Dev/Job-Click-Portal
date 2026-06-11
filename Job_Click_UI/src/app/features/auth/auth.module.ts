import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
// NOTE: layout component classes are imported via a RELATIVE path (not the
// @layouts alias). The Angular compiler cannot reliably re-emit cross-module
// component references through TS path aliases (TS-993004). Module imports via
// alias (e.g. @shared) are fine — this only applies to declared components.
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterCandidateComponent } from './components/register-candidate/register-candidate.component';
import { RegisterCompanyComponent } from './components/register-company/register-company.component';
import { AccountTypeSwitchComponent } from './components/account-type-switch/account-type-switch.component';

@NgModule({
  declarations: [
    AuthLayoutComponent,
    LoginComponent,
    RegisterCandidateComponent,
    RegisterCompanyComponent,
    AccountTypeSwitchComponent,
  ],
  imports: [SharedModule, AuthRoutingModule],
})
export class AuthModule {}
