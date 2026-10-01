export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Trimmed string, or null for empty / non-text values. */
export function toText(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Accepts JSON numbers (Usman) and decimal strings such as "1283.40" (Munhim serialises
 * Decimal values as strings). Returns null for anything else.
 */
export function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toObject(value) {
  return isPlainObject(value) ? value : {};
}
