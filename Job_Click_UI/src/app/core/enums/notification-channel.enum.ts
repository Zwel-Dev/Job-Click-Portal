/** Delivery channels for notifications (mirrors NOTIFICATIONS delivery prefs). */
export enum NotificationChannel {
  InApp = 'IN_APP',
  Email = 'EMAIL',
  Sms = 'SMS',
  Push = 'PUSH',
}

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  [NotificationChannel.InApp]: 'In-app',
  [NotificationChannel.Email]: 'Email',
  [NotificationChannel.Sms]: 'SMS',
  [NotificationChannel.Push]: 'Push',
};
