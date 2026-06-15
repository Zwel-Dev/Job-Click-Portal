import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { EMPLOYER_ROLES } from '@core/enums/role-code.enum';
import { Id } from '@core/models/common.model';
import { OutgoingMessage } from '@core/models/messaging.model';
import { MessagingService } from '../../services/messaging.service';
import { InviteResponse } from '../../components/message-thread/message-thread.component';
import {
  InterviewInviteDialogComponent,
  InterviewInviteDialogData,
} from '../../components/interview-invite-dialog/interview-invite-dialog.component';

/** Messages page — responsive two-pane (conversation list + thread). */
@Component({
  selector: 'app-messages-page',
  standalone: false,
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.scss',
})
export class MessagesPageComponent {
  private readonly service = inject(MessagingService);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly route = inject(ActivatedRoute);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly dialog = inject(MatDialog);

  readonly conversations = this.service.conversations;
  readonly conversationsLoading = this.service.conversationsLoading;
  readonly messages = this.service.messages;
  readonly messagesLoading = this.service.messagesLoading;

  readonly selectedId = signal<Id | null>(null);
  readonly currentUserId = computed(() => this.currentUser.user()?.id ?? 0);
  readonly canInvite = computed(() => this.currentUser.hasAnyRole(EMPLOYER_ROLES));
  readonly selected = computed(
    () => this.conversations().find((conversation) => conversation.id === this.selectedId()) ?? null,
  );
  readonly isHandset = toSignal(
    this.breakpointObserver.observe('(max-width: 860px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  /** Conversation requested via `?c=` deep-link (from the header panel). */
  private readonly requestedId = signal<Id | null>(null);

  constructor() {
    const requested = this.route.snapshot.queryParamMap.get('c');
    if (requested) {
      this.requestedId.set(Number(requested));
    }
    this.service.loadConversations();

    // Pick an initial conversation once the list arrives: the deep-linked one,
    // or (on desktop) the most recent. On mobile, start on the list.
    effect(() => {
      const conversations = this.conversations();
      if (this.selectedId() !== null || conversations.length === 0) {
        return;
      }
      const target = this.requestedId() ?? (this.isHandset() ? null : conversations[0].id);
      if (target !== null) {
        this.select(target);
      }
    });
  }

  select(id: Id): void {
    this.selectedId.set(id);
    this.service.openConversation(id);
  }

  back(): void {
    this.selectedId.set(null);
  }

  onSend(message: OutgoingMessage): void {
    const id = this.selectedId();
    if (id !== null) {
      this.service.send(id, message.body, message.attachments);
    }
  }

  onInvite(): void {
    const conversation = this.selected();
    if (!conversation) {
      return;
    }
    const data: InterviewInviteDialogData = {
      jobTitle: conversation.jobTitle,
      participantName: conversation.participantName,
    };
    this.dialog
      .open(InterviewInviteDialogComponent, { data, width: '480px', maxWidth: '94vw', autoFocus: false })
      .afterClosed()
      .subscribe((invite) => {
        if (invite) {
          this.service.sendInterviewInvite(conversation.id, invite);
        }
      });
  }

  onRespondInvite(response: InviteResponse): void {
    this.service.respondToInvite(response.message, response.accepted);
  }
}
