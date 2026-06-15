import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationItem } from '@core/models/notification.model';
import { NotificationService } from '../../services/notification.service';

type FeedFilter = 'all' | 'unread';

/** Full notification feed page (shared by /candidate/notifications and /employer/notifications). */
@Component({
  selector: 'app-notification-list',
  standalone: false,
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent implements OnInit {
  private readonly service = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loading = this.service.loading;
  readonly notifications = this.service.notifications;
  readonly unread = this.service.unreadCount;

  readonly filter = signal<FeedFilter>('all');
  readonly skeletons = [0, 1, 2, 3, 4];

  readonly filtered = computed(() => {
    const items = this.notifications();
    return this.filter() === 'unread' ? items.filter((item) => !item.read) : items;
  });

  ngOnInit(): void {
    this.service.load();
  }

  setFilter(value: FeedFilter): void {
    this.filter.set(value);
  }

  open(item: NotificationItem): void {
    this.service.markRead(item.id);
    if (item.link) {
      this.router.navigateByUrl(item.link);
    }
  }

  markAll(): void {
    this.service.markAllRead();
  }
}
