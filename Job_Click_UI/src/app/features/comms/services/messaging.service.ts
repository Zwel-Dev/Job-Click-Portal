import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { Id } from '@core/models/common.model';
import { Conversation, InterviewInvite, Message, MessageAttachment } from '@core/models/messaging.model';
import { NotificationType } from '@core/enums/notification-type.enum';
import { NotificationService } from './notification.service';
import { buildMockConversations, buildMockMessages, MockCurrentUser } from './mock/mock-conversations';

const MOCK_LATENCY = 350;
const ENDPOINT = '/api/v1/conversations';

/**
 * Conversations + messages for the signed-in user. Signal store so the header
 * panel and the full messages page share one source; `unreadCount` drives the
 * panel badge. Stateful mock — sent messages + read state persist for the session.
 */
@Injectable({ providedIn: 'root' })
export class MessagingService {
  private readonly api = inject(ApiBaseService);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly notifications = inject(NotificationService);

  readonly conversations = signal<Conversation[]>([]);
  readonly conversationsLoading = signal(false);
  readonly messages = signal<Message[]>([]);
  readonly messagesLoading = signal(false);

  readonly unreadCount = computed(() =>
    this.conversations().reduce((sum, conversation) => sum + conversation.unread, 0),
  );

  private loaded = false;
  private activeId: Id | null = null;
  private nextMessageId = 9000;

  loadConversations(force = false): void {
    if (this.conversationsLoading() || (this.loaded && !force)) {
      return;
    }
    this.conversationsLoading.set(true);
    this.fetchConversations().subscribe({
      next: (items) => {
        this.conversations.set(sortByRecent(items));
        this.loaded = true;
        this.conversationsLoading.set(false);
      },
      error: () => this.conversationsLoading.set(false),
    });
  }

  /** Loads a conversation's thread and marks it read. */
  openConversation(conversationId: Id): void {
    this.activeId = conversationId;
    this.messagesLoading.set(true);
    this.messages.set([]);
    this.fetchMessages(conversationId).subscribe({
      next: (items) => {
        this.messages.set(items);
        this.messagesLoading.set(false);
        this.markRead(conversationId);
      },
      error: () => this.messagesLoading.set(false),
    });
  }

  /** Appends a message to the active conversation and updates its summary. */
  send(conversationId: Id, body: string, attachments: MessageAttachment[]): void {
    const user = this.user();
    const message: Message = {
      id: this.nextMessageId++,
      conversationId,
      senderId: user.id,
      senderName: user.name,
      body,
      sentAt: new Date().toISOString(),
      attachments: attachments.length ? attachments : undefined,
    };

    if (!environment.useMock) {
      this.api.post<Message>(`${ENDPOINT}/${conversationId}/messages`, { body, attachments }).subscribe();
    }

    if (this.activeId === conversationId) {
      this.messages.update((items) => [...items, message]);
    }
    const summary = body || (attachments.length ? `${attachments.length} attachment(s)` : '');
    this.bumpConversation(conversationId, summary, message.sentAt);
  }

  /** Updates a conversation's last-message summary + timestamp and re-sorts. */
  private bumpConversation(conversationId: Id, summary: string, at: string): void {
    this.conversations.update((items) =>
      sortByRecent(
        items.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, lastMessage: summary, lastMessageAt: at }
            : conversation,
        ),
      ),
    );
  }

  /** Recruiter action: send an interview invitation as a message + a notification. */
  sendInterviewInvite(conversationId: Id, invite: InterviewInvite): void {
    const user = this.user();
    const conversation = this.conversations().find((item) => item.id === conversationId);
    const message: Message = {
      id: this.nextMessageId++,
      conversationId,
      senderId: user.id,
      senderName: user.name,
      body: '',
      sentAt: new Date().toISOString(),
      interviewInvite: { ...invite, status: 'pending' },
    };

    if (!environment.useMock) {
      this.api.post<Message>(`${ENDPOINT}/${conversationId}/interview-invite`, invite).subscribe();
    }
    if (this.activeId === conversationId) {
      this.messages.update((items) => [...items, message]);
    }
    this.bumpConversation(conversationId, `Interview invitation · ${invite.jobTitle}`, message.sentAt);
    this.notifications.push({
      type: NotificationType.InterviewInvite,
      title: 'Interview invitation sent',
      body: `You invited ${conversation?.participantName ?? 'the candidate'} to interview for ${invite.jobTitle}.`,
    });
  }

  /** Candidate action: accept/decline an invite — updates the card, replies, and notifies. */
  respondToInvite(message: Message, accepted: boolean): void {
    if (!message.interviewInvite) {
      return;
    }
    const user = this.user();
    const status = accepted ? 'accepted' : 'declined';
    const now = new Date().toISOString();

    if (!environment.useMock) {
      this.api.post<void>(`${ENDPOINT}/messages/${message.id}/respond`, { accepted }).subscribe();
    }

    this.messages.update((items) =>
      items.map((item) =>
        item.id === message.id && item.interviewInvite
          ? { ...item, interviewInvite: { ...item.interviewInvite, status } }
          : item,
      ),
    );
    const reply: Message = {
      id: this.nextMessageId++,
      conversationId: message.conversationId,
      senderId: user.id,
      senderName: user.name,
      body: accepted ? 'I accepted the interview invitation. Looking forward to it!' : 'Thank you, but I have to decline the interview invitation.',
      sentAt: now,
    };
    this.messages.update((items) => [...items, reply]);
    this.bumpConversation(message.conversationId, reply.body, now);
    this.notifications.push({
      type: NotificationType.InterviewInvite,
      title: accepted ? 'Interview accepted' : 'Interview declined',
      body: `You ${status} the interview invitation for ${message.interviewInvite.jobTitle}.`,
    });
  }

  markRead(conversationId: Id): void {
    if (!environment.useMock) {
      this.api.patch<void>(`${ENDPOINT}/${conversationId}/read`, {}).subscribe();
    }
    this.conversations.update((items) =>
      items.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
      ),
    );
  }

  private fetchConversations(): Observable<Conversation[]> {
    if (!environment.useMock) {
      return this.api.get<Conversation[]>(ENDPOINT);
    }
    return of(buildMockConversations(this.user())).pipe(delay(MOCK_LATENCY));
  }

  private fetchMessages(conversationId: Id): Observable<Message[]> {
    if (!environment.useMock) {
      return this.api.get<Message[]>(`${ENDPOINT}/${conversationId}/messages`);
    }
    return of(buildMockMessages(conversationId, this.user())).pipe(delay(MOCK_LATENCY));
  }

  private user(): MockCurrentUser {
    const user = this.currentUser.user();
    return { id: user?.id ?? 0, name: user?.fullName ?? 'You', roles: this.currentUser.roles() };
  }
}

function sortByRecent(items: Conversation[]): Conversation[] {
  return [...items].sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt));
}
