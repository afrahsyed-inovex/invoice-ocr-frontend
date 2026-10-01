export const EMPTY_VALUE = '—';

export function isMissing(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  return false;
}

const formatAmount = (value) =>
  new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

/**
 * Usman sends ISO 4217 codes ("CAD"), formatted with Intl so "CA$" and "$" stay distinct.
 * Munhim sends only the printed symbol ("$"), shown as-is: which dollar it is can't be known.
 */
export function formatMoney(value, currency) {
  if (isMissing(value)) return EMPTY_VALUE;
  if (typeof value !== 'number') return String(value);

  const marker = typeof currency === 'string' ? currency.trim() : '';
  if (/^[A-Z]{3}$/.test(marker)) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: marker }).format(value);
    } catch {
      return `${formatAmount(value)} ${marker}`;
    }
  }
  return marker ? `${marker}${formatAmount(value)}` : formatAmount(value);
}

export function formatQuantity(value) {
  if (isMissing(value)) return EMPTY_VALUE;
  if (typeof value !== 'number') return String(value);
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(value);
}

/** ISO dates (YYYY-MM-DD) are localized; anything else is shown exactly as extracted. */
export function formatDate(value) {
  if (isMissing(value)) return EMPTY_VALUE;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (!isoMatch) return String(value);

  const [, year, month, day] = isoMatch.map(Number);
  // Build the date in local time so "2024-03-05" never shifts to the previous day.
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function formatDateTime(value) {
  if (isMissing(value)) return EMPTY_VALUE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function formatText(value) {
  if (isMissing(value)) return EMPTY_VALUE;
  return String(value);
}

/** Percentages arrive as plain numbers: 10 means 10 %. */
export function formatPercent(value) {
  if (isMissing(value)) return EMPTY_VALUE;
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}%`;
}

export function formatConfidence(confidence) {
  // Keeps the backend value exactly (0.648 -> "64.8%"), no rounding.
  return `${Number((confidence * 100).toFixed(10))}%`;
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return EMPTY_VALUE;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
