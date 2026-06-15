import { AuditLogEntry } from '@core/models/admin-platform.model';
import { AuditAction } from '@core/enums/audit-action.enum';

const ADMIN = 'Aung Myo Thant';

/** ~28 recent audit entries seeding the trail; live admin actions prepend to this. */
export const MOCK_AUDIT_LOGS: readonly AuditLogEntry[] = [
  { id: 1, actorName: ADMIN, action: AuditAction.Approve, entityType: 'Verification', entityId: 11, summary: 'Approved verification for BrightPath Solutions', createdAt: '2026-06-14T06:12:00Z' },
  { id: 2, actorName: ADMIN, action: AuditAction.Suspend, entityType: 'Company', entityId: 14, summary: 'Suspended company SwiftMart Retail', createdAt: '2026-06-14T05:40:00Z' },
  { id: 3, actorName: ADMIN, action: AuditAction.Reject, entityType: 'Verification', entityId: 14, summary: 'Rejected verification for SwiftMart Retail', createdAt: '2026-06-13T09:02:00Z' },
  { id: 4, actorName: ADMIN, action: AuditAction.Suspend, entityType: 'User', entityId: 10, summary: 'Suspended user Wai Yan Moe', createdAt: '2026-06-13T08:58:00Z' },
  { id: 5, actorName: ADMIN, action: AuditAction.Delete, entityType: 'Job', entityId: 9, summary: 'Removed job "Work-from-home Data Entry — Earn Fast!"', createdAt: '2026-06-12T14:20:00Z' },
  { id: 6, actorName: ADMIN, action: AuditAction.Update, entityType: 'Job', entityId: 18, summary: 'Flagged job "Content Writer"', createdAt: '2026-06-12T11:05:00Z' },
  { id: 7, actorName: ADMIN, action: AuditAction.Approve, entityType: 'Verification', entityId: 12, summary: 'Approved verification for BlueWave Logistics', createdAt: '2026-06-11T07:30:00Z' },
  { id: 8, actorName: ADMIN, action: AuditAction.Update, entityType: 'User', entityId: 2, summary: 'Sent password reset link to recruiter@jobclick.dev', createdAt: '2026-06-10T03:15:00Z' },
  { id: 9, actorName: ADMIN, action: AuditAction.Update, entityType: 'Plan', entityId: 2, summary: 'Updated plan "Pro" pricing', createdAt: '2026-06-09T10:00:00Z' },
  { id: 10, actorName: ADMIN, action: AuditAction.Create, entityType: 'Skill', entityId: 41, summary: 'Added skill "Kubernetes"', createdAt: '2026-06-09T09:45:00Z' },
  { id: 11, actorName: ADMIN, action: AuditAction.Update, entityType: 'Feature flag', entityId: 3, summary: 'Enabled feature flag "AI job matching"', createdAt: '2026-06-08T16:20:00Z' },
  { id: 12, actorName: ADMIN, action: AuditAction.Reactivate, entityType: 'User', entityId: 7, summary: 'Reactivated user Ei Ei Phyo', createdAt: '2026-06-08T08:00:00Z' },
  { id: 13, actorName: ADMIN, action: AuditAction.Approve, entityType: 'Verification', entityId: 15, summary: 'Approved verification for Horizon Media House', createdAt: '2026-06-07T05:25:00Z' },
  { id: 14, actorName: ADMIN, action: AuditAction.Update, entityType: 'Job', entityId: 15, summary: 'Flagged job "Easy Money — No Experience Needed"', createdAt: '2026-06-06T13:40:00Z' },
  { id: 15, actorName: ADMIN, action: AuditAction.Delete, entityType: 'Job', entityId: 33, summary: 'Removed duplicate job posting', createdAt: '2026-06-05T12:10:00Z' },
  { id: 16, actorName: ADMIN, action: AuditAction.Suspend, entityType: 'User', entityId: 22, summary: 'Suspended user for spam applications', createdAt: '2026-06-05T02:50:00Z' },
  { id: 17, actorName: ADMIN, action: AuditAction.Update, entityType: 'Company', entityId: 12, summary: 'Updated company notes for BlueWave Logistics', createdAt: '2026-06-04T09:30:00Z' },
  { id: 18, actorName: ADMIN, action: AuditAction.Create, entityType: 'Skill', entityId: 40, summary: 'Added skill "Terraform"', createdAt: '2026-06-04T09:20:00Z' },
  { id: 19, actorName: ADMIN, action: AuditAction.Reactivate, entityType: 'Company', entityId: 18, summary: 'Reactivated company after review', createdAt: '2026-06-03T11:00:00Z' },
  { id: 20, actorName: ADMIN, action: AuditAction.Approve, entityType: 'Verification', entityId: 19, summary: 'Approved verification for Northstar Foods', createdAt: '2026-06-02T06:45:00Z' },
  { id: 21, actorName: ADMIN, action: AuditAction.Delete, entityType: 'Plan', entityId: 9, summary: 'Removed legacy plan "Starter"', createdAt: '2026-06-01T15:30:00Z' },
  { id: 22, actorName: ADMIN, action: AuditAction.Update, entityType: 'Feature flag', entityId: 1, summary: 'Disabled feature flag "Public profiles"', createdAt: '2026-05-30T10:15:00Z' },
  { id: 23, actorName: ADMIN, action: AuditAction.Suspend, entityType: 'Company', entityId: 27, summary: 'Suspended company flagged as fake', createdAt: '2026-05-29T08:05:00Z' },
  { id: 24, actorName: ADMIN, action: AuditAction.Update, entityType: 'User', entityId: 31, summary: 'Sent password reset link', createdAt: '2026-05-28T07:40:00Z' },
  { id: 25, actorName: ADMIN, action: AuditAction.Approve, entityType: 'Verification', entityId: 21, summary: 'Approved verification for Lotus Hospitality', createdAt: '2026-05-27T05:00:00Z' },
  { id: 26, actorName: ADMIN, action: AuditAction.Reject, entityType: 'Verification', entityId: 24, summary: 'Rejected verification — illegible documents', createdAt: '2026-05-26T09:25:00Z' },
  { id: 27, actorName: ADMIN, action: AuditAction.Create, entityType: 'Skill', entityId: 39, summary: 'Added skill "Power BI"', createdAt: '2026-05-25T14:50:00Z' },
  { id: 28, actorName: ADMIN, action: AuditAction.Delete, entityType: 'Job', entityId: 12, summary: 'Removed expired scam posting', createdAt: '2026-05-24T11:35:00Z' },
];
