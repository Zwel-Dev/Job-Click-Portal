import { NotificationItem, NotificationPreference } from '@core/models/notification.model';
import { NotificationType } from '@core/enums/notification-type.enum';
import { RoleCode } from '@core/enums/role-code.enum';

/** Default channel preferences by notification category (in-app always on). */
export const MOCK_NOTIFICATION_PREFERENCES: readonly NotificationPreference[] = [
  { key: 'applications', label: 'Application activity', description: 'New applications and status changes.', channels: { inApp: true, email: true, sms: false, push: true } },
  { key: 'messages', label: 'Messages', description: 'New messages and replies.', channels: { inApp: true, email: true, sms: false, push: true } },
  { key: 'interviews', label: 'Interviews', description: 'Interview invitations and confirmations.', channels: { inApp: true, email: true, sms: true, push: true } },
  { key: 'recommendations', label: 'Recommendations', description: 'New job matches for your profile.', channels: { inApp: true, email: false, sms: false, push: false } },
  { key: 'product', label: 'Product & tips', description: 'Occasional product updates and tips.', channels: { inApp: true, email: false, sms: false, push: false } },
];

/**
 * Builds a role-appropriate notification feed for the signed-in user so each
 * workspace shows realistic activity. Candidates see application/recommendation/
 * message activity; employer users see applications/messages/offers (company
 * admins also get verification updates).
 */
export function buildMockNotifications(roles: readonly RoleCode[]): NotificationItem[] {
  if (roles.includes(RoleCode.Candidate)) {
    return CANDIDATE_NOTIFICATIONS.map(clone);
  }
  const items = [...EMPLOYER_NOTIFICATIONS];
  if (roles.includes(RoleCode.CompanyAdmin)) {
    items.unshift(...COMPANY_ADMIN_NOTIFICATIONS);
  }
  return items.map(clone);
}

const CANDIDATE_NOTIFICATIONS: readonly NotificationItem[] = [
  { id: 1, type: NotificationType.ApplicationUpdate, title: 'Application shortlisted', body: 'Greenline Technologies moved your application for Frontend Engineer to Shortlisted.', createdAt: '2026-06-15T01:30:00Z', read: false, link: '/candidate/applications' },
  { id: 2, type: NotificationType.NewMessage, title: 'Message from Kyaw Zin Latt', body: 'Thanks for applying! Do you have time for a quick call this week?', createdAt: '2026-06-14T08:10:00Z', read: false, link: '/candidate/messages' },
  { id: 3, type: NotificationType.InterviewInvite, title: 'Interview invitation', body: 'BlueWave Logistics invited you to interview for Logistics Coordinator.', createdAt: '2026-06-13T11:00:00Z', read: false, link: '/candidate/applications' },
  { id: 4, type: NotificationType.JobRecommendation, title: '3 new job matches', body: 'New roles matching your profile were posted today.', createdAt: '2026-06-13T06:00:00Z', read: true, link: '/candidate/recommendations' },
  { id: 5, type: NotificationType.ApplicationUpdate, title: 'Application viewed', body: 'A recruiter at BrightPath Solutions viewed your application.', createdAt: '2026-06-12T14:20:00Z', read: true, link: '/candidate/applications' },
  { id: 6, type: NotificationType.System, title: 'Welcome to Job Click', body: 'Complete your profile to get better job recommendations.', createdAt: '2026-06-10T09:00:00Z', read: true, link: '/candidate/profile' },
];

const EMPLOYER_NOTIFICATIONS: readonly NotificationItem[] = [
  { id: 11, type: NotificationType.NewApplication, title: 'New application', body: 'Su Su Hlaing applied to Frontend Engineer (Angular).', createdAt: '2026-06-15T02:05:00Z', read: false, link: '/employer/jobs' },
  { id: 12, type: NotificationType.NewMessage, title: 'Candidate reply', body: 'Ei Ei Phyo replied to your message about the Data Analyst role.', createdAt: '2026-06-14T09:40:00Z', read: false, link: '/employer/messages' },
  { id: 13, type: NotificationType.OfferResponse, title: 'Offer accepted', body: 'Min Khant Kyaw accepted the offer for Warehouse Supervisor.', createdAt: '2026-06-13T15:30:00Z', read: false, link: '/employer/offers' },
  { id: 14, type: NotificationType.NewApplication, title: '5 new applications', body: 'Your Product Designer posting received 5 applications today.', createdAt: '2026-06-13T07:15:00Z', read: true, link: '/employer/jobs' },
  { id: 15, type: NotificationType.InterviewInvite, title: 'Interview confirmed', body: 'A candidate confirmed the interview slot for Senior Backend Engineer.', createdAt: '2026-06-12T10:00:00Z', read: true, link: '/employer/jobs' },
];

const COMPANY_ADMIN_NOTIFICATIONS: readonly NotificationItem[] = [
  { id: 21, type: NotificationType.VerificationUpdate, title: 'Verification under review', body: 'Your company verification submission is being reviewed by the Job Click team.', createdAt: '2026-06-14T05:00:00Z', read: false, link: '/employer/company/verification' },
];

function clone(value: NotificationItem): NotificationItem {
  return { ...value };
}
