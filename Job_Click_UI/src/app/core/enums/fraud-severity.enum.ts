import { StatusTone } from './application-status.enum';

/** Severity of a fraud/integrity signal (mirrors the §6 tone mapping). */
export enum FraudSeverity {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
}

export const FRAUD_SEVERITY_META: Record<FraudSeverity, { label: string; tone: StatusTone }> = {
  [FraudSeverity.Low]: { label: 'Low', tone: 'neutral' },
  [FraudSeverity.Medium]: { label: 'Medium', tone: 'progress' },
  [FraudSeverity.High]: { label: 'High', tone: 'danger' },
};
