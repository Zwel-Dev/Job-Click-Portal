import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { InviteRoutingModule } from './invite-routing.module';
import { AcceptInvitationComponent } from './pages/accept/accept-invitation.component';

/** Public invitation-acceptance flow (guard-free — reachable logged in or out). */
@NgModule({
  declarations: [AcceptInvitationComponent],
  imports: [SharedModule, InviteRoutingModule],
})
export class InviteModule {}
