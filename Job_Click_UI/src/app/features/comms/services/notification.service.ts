import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { Id } from '@core/models/common.model';
import { NotificationItem, NotificationPreference, PreferenceChannels } from '@core/models/notification.model';
import { NotificationType } from '@core/enums/notification-type.enum';
import { buildMockNotifications, MOCK_NOTIFICATION_PREFERENCES } from './mock/mock-notifications';

const MOCK_LATENCY = 350;
const ENDPOINT = '/api/v1/notifications';

/**
 * In-app notification feed for the signed-in user. Signal store so the header
 * bell and the feed page share one reactive source; the `unreadCount` signal
 * drives the bell badge. Stateful mock — read state persists for the session.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiBaseService);
  private readonly currentUser = inject(CurrentUserStore);

  readonly notifications = signal<NotificationItem[]>([]);
  readonly loading = signal(false);
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);

  private loaded = false;
  private prefs: NotificationPreference[] = clonePrefs(MOCK_NOTIFICATION_PREFERENCES);
  private nextId = 5000;

  /** Push a notification into the current user's feed (used by other features). */
  push(input: { type: NotificationType; title: string; body: string; link?: string }): void {
    const item: NotificationItem = {
      id: this.nextId++,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.notifications.update((items) => [item, ...items]);
  }

  /** Loads the feed once; pass `force` to refetch. */
  load(force = false): void {
    if (this.loading() || (this.loaded && !force)) {
      return;
    }
    this.loading.set(true);
    this.fetch().subscribe({
      next: (items) => {
        this.notifications.set(sortByNewest(items));
        this.loaded = true;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /**
   * Realtime refresh hook (driven by `RealtimeService` polling). In the mock the
   * feed is the local source of truth, so this is a no-op; the real backend
   * merges any new server-side notifications.
   */
  refresh(): Observable<NotificationItem[]> {
    if (!environment.useMock) {
      return this.fetch().pipe(tap((items) => this.notifications.set(sortByNewest(items))));
    }
    return of(this.notifications());
  }

  markRead(id: Id): void {
    if (!environment.useMock) {
      this.api.patch<void>(`${ENDPOINT}/${id}/read`, {}).subscribe();
    }
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  markAllRead(): void {
    if (!environment.useMock) {
      this.api.post<void>(`${ENDPOINT}/read-all`, {}).subscribe();
    }
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
  }

  // --- Channel preferences --------------------------------------------------

  preferences(): Observable<NotificationPreference[]> {
    if (!environment.useMock) {
      return this.api.get<NotificationPreference[]>(`${ENDPOINT}/preferences`);
    }
    return of(clonePrefs(this.prefs)).pipe(delay(MOCK_LATENCY));
  }

  updatePreference(key: string, channels: PreferenceChannels): Observable<NotificationPreference> {
    if (!environment.useMock) {
      return this.api.put<NotificationPreference>(`${ENDPOINT}/preferences/${key}`, { channels });
    }
    this.prefs = this.prefs.map((pref) => (pref.key === key ? { ...pref, channels: { ...channels } } : pref));
    const updated = this.prefs.find((pref) => pref.key === key)!;
    return of({ ...updated, channels: { ...updated.channels } }).pipe(delay(MOCK_LATENCY));
  }

  private fetch(): Observable<NotificationItem[]> {
    if (!environment.useMock) {
      return this.api.get<NotificationItem[]>(ENDPOINT);
    }
    return of(buildMockNotifications(this.currentUser.roles())).pipe(delay(MOCK_LATENCY));
  }
}

function clonePrefs(prefs: readonly NotificationPreference[]): NotificationPreference[] {
  return prefs.map((pref) => ({ ...pref, channels: { ...pref.channels } }));
}

function sortByNewest(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
