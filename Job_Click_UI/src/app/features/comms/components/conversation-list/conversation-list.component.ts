import { Component, input, output } from '@angular/core';
import { Id } from '@core/models/common.model';
import { Conversation } from '@core/models/messaging.model';
import { timeAgo } from '@core/utils/format';

/** Presentational conversation list for the messages page. */
@Component({
  selector: 'app-conversation-list',
  standalone: false,
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss',
})
export class ConversationListComponent {
  readonly conversations = input.required<Conversation[]>();
  readonly selectedId = input<Id | null>(null);
  readonly select = output<Id>();

  readonly timeAgo = timeAgo;
}
