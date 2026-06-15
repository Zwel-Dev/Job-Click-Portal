import { Component, computed, input, output } from '@angular/core';
import { StatusTone } from '@core/enums/application-status.enum';
import { InterviewInvite, InterviewInviteStatus } from '@core/models/messaging.model';

const STATUS_META: Record<InterviewInviteStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Awaiting response', tone: 'progress' },
  accepted: { label: 'Accepted', tone: 'success' },
  declined: { label: 'Declined', tone: 'danger' },
};

/** Inline interview-invitation card rendered within a message thread. */
@Component({
  selector: 'app-interview-invite-card',
  standalone: false,
  templateUrl: './interview-invite-card.component.html',
  styleUrl: './interview-invite-card.component.scss',
})
export class InterviewInviteCardComponent {
  readonly invite = input.required<InterviewInvite>();
  /** True when the current user is the recipient and the invite is still pending. */
  readonly canRespond = input(false);
  readonly respond = output<boolean>();

  readonly statusMeta = computed(() => STATUS_META[this.invite().status]);
  readonly when = computed(() =>
    new Date(this.invite().proposedAt).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
  );
}
