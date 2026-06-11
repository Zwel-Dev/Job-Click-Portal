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
