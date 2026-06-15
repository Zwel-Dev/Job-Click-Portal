/** Categories of platform-integrity signal surfaced to admins (PA2.1). */
export enum FraudSignalType {
  FakeCompany = 'FAKE_COMPANY',
  DuplicateJob = 'DUPLICATE_JOB',
  SpamApplications = 'SPAM_APPLICATIONS',
  ScamJob = 'SCAM_JOB',
  SuspiciousLogin = 'SUSPICIOUS_LOGIN',
}

export const FRAUD_SIGNAL_TYPE_LABELS: Record<FraudSignalType, string> = {
  [FraudSignalType.FakeCompany]: 'Fake company',
  [FraudSignalType.DuplicateJob]: 'Duplicate job',
  [FraudSignalType.SpamApplications]: 'Spam applications',
  [FraudSignalType.ScamJob]: 'Scam posting',
  [FraudSignalType.SuspiciousLogin]: 'Suspicious login',
};

/** Icon per type for the fraud signal cards / dashboard widget. */
export const FRAUD_SIGNAL_TYPE_META: Record<FraudSignalType, { label: string; icon: string }> = {
  [FraudSignalType.FakeCompany]: { label: 'Fake company', icon: 'business' },
  [FraudSignalType.DuplicateJob]: { label: 'Duplicate job', icon: 'content_copy' },
  [FraudSignalType.SpamApplications]: { label: 'Spam applications', icon: 'forum' },
  [FraudSignalType.ScamJob]: { label: 'Scam posting', icon: 'report' },
  [FraudSignalType.SuspiciousLogin]: { label: 'Suspicious login', icon: 'lock' },
};
