import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiError } from '@core/models/common.model';
import { NotificationPreference, PreferenceChannels } from '@core/models/notification.model';
import { NotificationChannel, NOTIFICATION_CHANNEL_LABELS } from '@core/enums/notification-channel.enum';
import { ToastService } from '@core/services/toast.service';
import { NotificationService } from '../../services/notification.service';

type ChannelKey = keyof PreferenceChannels;

interface ChannelColumn {
  key: ChannelKey;
  label: string;
  /** In-app is always on (the feed) and can't be disabled. */
  locked: boolean;
}

/** Notification channel preferences (doc 07 §2 — managed in-app). */
@Component({
  selector: 'app-notification-preferences',
  standalone: false,
  templateUrl: './notification-preferences.component.html',
  styleUrl: './notification-preferences.component.scss',
})
export class NotificationPreferencesComponent implements OnInit {
  private readonly service = inject(NotificationService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly preferences = signal<NotificationPreference[]>([]);

  readonly columns: ChannelColumn[] = [
    { key: 'inApp', label: NOTIFICATION_CHANNEL_LABELS[NotificationChannel.InApp], locked: true },
    { key: 'email', label: NOTIFICATION_CHANNEL_LABELS[NotificationChannel.Email], locked: false },
    { key: 'sms', label: NOTIFICATION_CHANNEL_LABELS[NotificationChannel.Sms], locked: false },
    { key: 'push', label: NOTIFICATION_CHANNEL_LABELS[NotificationChannel.Push], locked: false },
  ];

  ngOnInit(): void {
    this.load();
  }

  toggle(pref: NotificationPreference, key: ChannelKey, enabled: boolean): void {
    const channels: PreferenceChannels = { ...pref.channels, [key]: enabled };
    // Optimistic update.
    this.preferences.update((items) =>
      items.map((item) => (item.key === pref.key ? { ...item, channels } : item)),
    );
    this.service.updatePreference(pref.key, channels).subscribe({
      next: () => this.toast.success('Notification preferences updated.'),
      error: (error: ApiError) => {
        this.toast.error(error.message ?? 'Could not update preferences.');
        this.load();
      },
    });
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.preferences().subscribe({
      next: (prefs) => {
        this.preferences.set(prefs);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load preferences.');
        this.loading.set(false);
      },
    });
  }
}
