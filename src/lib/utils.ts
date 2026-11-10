/**
 * Formats NPR currency with the Nepali 'रु' symbol and thousands separator.
 * Example: 4500 -> "रु 4,500"
 */
export function formatNPR(amount: number | string | null | undefined): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return 'रु 0';
  return `रु ${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Validates Nepal phone numbers: +977 followed by 8 to 10 digits
 * e.g., +9779841234567, +97761463901
 */
export function isValidNepalPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.trim().replace(/[\s\-]/g, '');
  return /^\+977[0-9]{8,10}$/.test(cleaned);
}

/**
 * Adds days to a date string (YYYY-MM-DD)
 */
export function addDays(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().split('T')[0];
}

/**
 * Formats standard date
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
