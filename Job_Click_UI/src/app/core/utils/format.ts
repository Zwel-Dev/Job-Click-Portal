/** Formats a salary range like "2,500,000 - 3,500,000 MMK", or "Negotiable". */
export function formatSalary(job: { salaryMin?: number; salaryMax?: number; currency?: string }): string {
  const { salaryMin, salaryMax, currency } = job;
  if (!salaryMin && !salaryMax) {
    return 'Negotiable';
  }
  const suffix = currency ? ` ${currency}` : '';
  const fmt = (value: number): string => value.toLocaleString('en-US');
  if (salaryMin && salaryMax) {
    return `${fmt(salaryMin)} - ${fmt(salaryMax)}${suffix}`;
  }
  return `${fmt(salaryMin ?? salaryMax ?? 0)}${suffix}`;
}

/** Formats an ISO date as "Jun 2, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Formats a timestamp as a short relative age ("5m ago", "3h ago", "2d ago"), or a date if older. */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return formatDate(iso);
}

/** Formats a money amount like "$199" (USD) or "199 MMK". */
export function formatMoney(amount: number, currency = 'USD'): string {
  const value = amount.toLocaleString('en-US');
  return currency === 'USD' ? `$${value}` : `${value} ${currency}`;
}

/** Formats a byte count as "240 KB" / "1.4 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
