/** Notification categories surfaced in the in-app feed (mirrors NOTIFICATIONS.type). */
export enum NotificationType {
  NewApplication = 'NEW_APPLICATION',
  ApplicationUpdate = 'APPLICATION_UPDATE',
  NewMessage = 'NEW_MESSAGE',
  InterviewInvite = 'INTERVIEW_INVITE',
  OfferResponse = 'OFFER_RESPONSE',
  JobRecommendation = 'JOB_RECOMMENDATION',
  VerificationUpdate = 'VERIFICATION_UPDATE',
  System = 'SYSTEM',
}

/** Label + icon per type for the feed and bell dropdown. */
export const NOTIFICATION_TYPE_META: Record<NotificationType, { label: string; icon: string }> = {
  [NotificationType.NewApplication]: { label: 'New application', icon: 'person_add' },
  [NotificationType.ApplicationUpdate]: { label: 'Application update', icon: 'description' },
  [NotificationType.NewMessage]: { label: 'Message', icon: 'chat_bubble_outline' },
  [NotificationType.InterviewInvite]: { label: 'Interview', icon: 'event' },
  [NotificationType.OfferResponse]: { label: 'Offer', icon: 'mail_outline' },
  [NotificationType.JobRecommendation]: { label: 'Recommendation', icon: 'auto_awesome' },
  [NotificationType.VerificationUpdate]: { label: 'Verification', icon: 'verified_user' },
  [NotificationType.System]: { label: 'System', icon: 'info' },
};
