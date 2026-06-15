import { Id } from './common.model';
import { NotificationType } from '@core/enums/notification-type.enum';

/** A single in-app notification (mirrors NOTIFICATIONS). */
export interface NotificationItem {
  id: Id;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Optional in-app deep link (router path) to the related entity. */
  link?: string;
}

/** Per-channel delivery toggles for a notification category. In-app is always on. */
export interface PreferenceChannels {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

/** A notification category with its channel preferences (NotificationPreferences screen). */
export interface NotificationPreference {
  key: string;
  label: string;
  description?: string;
  channels: PreferenceChannels;
}
