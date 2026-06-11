import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterCandidateComponent } from './components/register-candidate/register-candidate.component';
import { RegisterCompanyComponent } from './components/register-company/register-company.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent, title: 'Sign in | Job Click Portal' },
      {
        path: 'register',
        component: RegisterCandidateComponent,
        title: 'Create your account | Job Click Portal',
      },
      {
        path: 'register-company',
        component: RegisterCompanyComponent,
        title: 'Register your company | Job Click Portal',
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
