import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceptInvitationComponent } from './pages/accept/accept-invitation.component';

const routes: Routes = [
  { path: 'accept', component: AcceptInvitationComponent, title: 'Accept invitation | Job Click' },
  { path: '', pathMatch: 'full', redirectTo: 'accept' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InviteRoutingModule {}
