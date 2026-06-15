import { Component, DestroyRef, OnInit, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationItem } from '@core/models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { RealtimeService } from '../../services/realtime.service';

/** Header notification bell — unread badge + recent dropdown (doc 07 §2). */
@Component({
  selector: 'app-notification-bell',
  standalone: false,
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss',
})
export class NotificationBellComponent implements OnInit {
  /** Route to the full feed for the host workspace, e.g. '/candidate/notifications'. */
  readonly allRoute = input.required<string>();

  private readonly service = inject(NotificationService);
  private readonly realtime = inject(RealtimeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly unread = this.service.unreadCount;
  readonly recent = computed(() => this.service.notifications().slice(0, 6));

  ngOnInit(): void {
    this.service.load();
    // Phase-2 realtime: poll the backend for new notifications (no-op in mock).
    this.realtime
      .poll(() => this.service.refresh())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
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
