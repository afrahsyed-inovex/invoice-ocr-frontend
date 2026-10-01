export const EMPTY_VALUE = '—';

const CURRENCY_SYMBOLS = {
  $: 'USD',
  US$: 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  Rs: 'PKR',
  'Rs.': 'PKR',
};

export function isMissing(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  return false;
}

/** Turns "USD", "usd" or "$" into an ISO 4217 code; returns null when unknown. */
export function toCurrencyCode(currency) {
  if (typeof currency !== 'string') return null;
  const trimmed = currency.trim();
  if (/^[a-z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
  return CURRENCY_SYMBOLS[trimmed] ?? null;
}

export function formatMoney(value, currency) {
  if (isMissing(value)) return EMPTY_VALUE;
  if (typeof value !== 'number') return String(value);

  const code = toCurrencyCode(currency);
  const options = code
    ? { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  try {
    return new Intl.NumberFormat(undefined, options).format(value);
  } catch {
    return value.toFixed(2);
  }
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

export function formatText(value) {
  if (isMissing(value)) return EMPTY_VALUE;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value) && value.every((item) => item === null || typeof item !== 'object')) {
    return value.join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export function isComplexValue(value) {
  if (Array.isArray(value)) return value.some((item) => item !== null && typeof item === 'object');
  return value !== null && typeof value === 'object';
}

export function formatConfidence(confidence) {
  return `${Math.round(confidence * 100)}%`;
}

/** "payment_terms", "PaymentTerms" and "paymentTerms" all become "Payment terms". */
export function humanizeKey(key) {
  const words = String(key)
    .replace(/[_\-.]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return EMPTY_VALUE;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
