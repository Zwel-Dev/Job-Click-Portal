import { Component, computed, input, output } from '@angular/core';
import { NotificationItem } from '@core/models/notification.model';
import { NOTIFICATION_TYPE_META } from '@core/enums/notification-type.enum';
import { timeAgo } from '@core/utils/format';

/** Presentational notification row — used by both the bell dropdown and the feed page. */
@Component({
  selector: 'app-notification-item',
  standalone: false,
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.scss',
})
export class NotificationItemComponent {
  readonly item = input.required<NotificationItem>();
  /** Tighter layout for the header dropdown. */
  readonly compact = input(false);
  readonly open = output<NotificationItem>();

  readonly timeAgo = timeAgo;
  readonly typeMeta = computed(() => NOTIFICATION_TYPE_META[this.item().type]);
}
