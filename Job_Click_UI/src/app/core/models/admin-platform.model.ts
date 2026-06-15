import { Id } from './common.model';
import { JobStatus } from '@core/enums/job-status.enum';
import { FraudSignalType } from '@core/enums/fraud-signal-type.enum';
import { FraudSeverity } from '@core/enums/fraud-severity.enum';
import { AuditAction } from '@core/enums/audit-action.enum';

/** Platform-wide headline metrics for the admin dashboard KPI strip (PA1.0). */
export interface SystemKpis {
  totalUsers: number;
  candidates: number;
  companies: number;
  activeJobs: number;
  pendingVerifications: number;
  openFraudSignals: number;
  applicationsToday: number;
}

/** A job seen through the moderation lens (PA2.0). */
export interface ModeratedJob {
  id: Id;
  title: string;
  companyName: string;
  status: JobStatus;
  flagged: boolean;
  flagReason?: string;
  applicants: number;
  postedAt: string;
  duplicateOf?: Id;
  /** Terminal: an admin took the posting down (no JobStatus.Removed in the ERD). */
  removed?: boolean;
}

/** The kind of entity a fraud signal points at (drives deep-link + act-on). */
export type FraudEntityType = 'user' | 'company' | 'job';

/** A surfaced fraud/integrity signal (PA2.1). */
export interface FraudSignal {
  id: Id;
  type: FraudSignalType;
  severity: FraudSeverity;
  entityLabel: string;
  detail: string;
  detectedAt: string;
  resolved: boolean;
  /** Linked entity, when the signal maps to a real user/company/job. */
  entityType?: FraudEntityType;
  entityId?: Id;
  /** Stamped when an admin resolves or acts on the signal. */
  resolvedBy?: string;
}

/** A read-only entry in the platform audit trail (PA2.3). */
export interface AuditLogEntry {
  id: Id;
  actorName: string;
  action: AuditAction;
  entityType: string;
  entityId: Id;
  summary: string;
  createdAt: string;
}
