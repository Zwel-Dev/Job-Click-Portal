import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';
import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';
import { NotificationListComponent } from './pages/notifications/notification-list.component';
import { ConversationListComponent } from './components/conversation-list/conversation-list.component';
import { MessageComposerComponent } from './components/message-composer/message-composer.component';
import { MessageThreadComponent } from './components/message-thread/message-thread.component';
import { MessagingPanelComponent } from './components/messaging-panel/messaging-panel.component';
import { InterviewInviteCardComponent } from './components/interview-invite-card/interview-invite-card.component';
import { InterviewInviteDialogComponent } from './components/interview-invite-dialog/interview-invite-dialog.component';
import { MessagesPageComponent } from './pages/messages/messages-page.component';
import { NotificationPreferencesComponent } from './pages/notification-preferences/notification-preferences.component';

/**
 * Cross-cutting messaging & notifications components shared by the Candidate and
 * Employer workspaces (doc 07). Services are root-provided; this module exports
 * the header widgets + routed pages for host modules to consume.
 */
@NgModule({
  declarations: [
    NotificationItemComponent,
    NotificationBellComponent,
    NotificationListComponent,
    ConversationListComponent,
    MessageComposerComponent,
    MessageThreadComponent,
    MessagingPanelComponent,
    InterviewInviteCardComponent,
    InterviewInviteDialogComponent,
    MessagesPageComponent,
    NotificationPreferencesComponent,
  ],
  imports: [SharedModule],
  exports: [
    NotificationBellComponent,
    NotificationListComponent,
    MessagingPanelComponent,
    MessagesPageComponent,
    NotificationPreferencesComponent,
  ],
})
export class CommsModule {}
