import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth.guard';
import { guestGuard } from '@core/auth/guards/guest.guard';
import { candidateGuard } from '@core/auth/guards/candidate.guard';
import { employerGuard } from '@core/auth/guards/employer.guard';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('@features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    // Invitation acceptance — guard-free (reachable signed in or out).
    path: 'invite',
    loadChildren: () => import('@features/invite/invite.module').then((m) => m.InviteModule),
  },
  {
    path: 'candidate',
    canActivate: [authGuard, candidateGuard],
    loadChildren: () => import('@features/candidate/candidate.module').then((m) => m.CandidateModule),
  },
  {
    path: 'employer',
    canActivate: [authGuard, employerGuard],
    loadChildren: () => import('@features/employer/employer.module').then((m) => m.EmployerModule),
  },
  {
    path: 'welcome',
    canActivate: [authGuard],
    component: WelcomeComponent,
    title: 'Job Click Portal',
  },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
