import { Component, OnInit, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Conversation } from '@core/models/messaging.model';
import { timeAgo } from '@core/utils/format';
import { MessagingService } from '../../services/messaging.service';

/** Header messaging panel — unread badge + recent conversations dropdown (doc 07 §2). */
@Component({
  selector: 'app-messaging-panel',
  standalone: false,
  templateUrl: './messaging-panel.component.html',
  styleUrl: './messaging-panel.component.scss',
})
export class MessagingPanelComponent implements OnInit {
  /** Base route to the full messages page, e.g. '/candidate/messages'. */
  readonly allRoute = input.required<string>();

  private readonly service = inject(MessagingService);
  private readonly router = inject(Router);

  readonly unread = this.service.unreadCount;
  readonly recent = computed(() => this.service.conversations().slice(0, 6));

  readonly timeAgo = timeAgo;

  ngOnInit(): void {
    this.service.loadConversations();
  }

  open(conversation: Conversation): void {
    this.router.navigate([this.allRoute()], { queryParams: { c: conversation.id } });
  }
}
