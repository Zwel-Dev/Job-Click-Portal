import { AdminUser } from '@core/models/admin-user.model';
import { VerificationReviewItem } from '@core/models/verification-review.model';
import { FraudSignal } from '@core/models/admin-platform.model';

/** The three queue widgets shown beneath the dashboard KPI strip (PA1.0 §8.0). */
export interface AdminDashboardWidgets {
  pendingVerifications: VerificationReviewItem[];
  recentSignups: AdminUser[];
  recentFraudSignals: FraudSignal[];
}
