import { Component, input, output } from '@angular/core';
import { Id } from '@core/models/common.model';
import { Conversation, Message, OutgoingMessage } from '@core/models/messaging.model';
import { timeAgo } from '@core/utils/format';

/** Emitted when the current user accepts/declines an interview invite. */
export interface InviteResponse {
  message: Message;
  accepted: boolean;
}

/** Conversation thread: header, message bubbles (mine vs theirs), and the composer. */
@Component({
  selector: 'app-message-thread',
  standalone: false,
  templateUrl: './message-thread.component.html',
  styleUrl: './message-thread.component.scss',
})
export class MessageThreadComponent {
  readonly conversation = input.required<Conversation | null>();
  readonly messages = input.required<Message[]>();
  readonly currentUserId = input.required<Id>();
  readonly loading = input(false);
  /** Recruiter-side: can send interview invitations. */
  readonly canInvite = input(false);
  readonly send = output<OutgoingMessage>();
  readonly back = output<void>();
  readonly invite = output<void>();
  readonly respondInvite = output<InviteResponse>();

  readonly timeAgo = timeAgo;
  readonly skeletons = [0, 1, 2];

  mine(message: Message): boolean {
    return message.senderId === this.currentUserId();
  }

  /** The recipient can respond to a still-pending invite. */
  canRespond(message: Message): boolean {
    return !this.mine(message) && message.interviewInvite?.status === 'pending';
  }
}
