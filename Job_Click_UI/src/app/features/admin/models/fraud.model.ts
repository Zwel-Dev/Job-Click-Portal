import { FraudSignal } from '@core/models/admin-platform.model';
import { FraudSignalType } from '@core/enums/fraud-signal-type.enum';

/** What "act on the entity" does (reuses user/company suspension or job removal). */
export type FraudActionKind = 'suspend' | 'remove';

/** Signals grouped under one fraud type (the dashboard's card sections). */
export interface FraudSignalGroup {
  type: FraudSignalType;
  signals: FraudSignal[];
}
