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
 * Parses OCR-style numbers: 1337.33, "$ 1,337.33", "1 337,33", "1.337,33".
 * When both "," and "." appear, the last one is the decimal separator.
 */
export function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  let cleaned = value.replace(/[^\d,.-]/g, '');
  if (!/\d/.test(cleaned)) return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    cleaned = cleaned.split(thousandsSeparator).join('').replace(decimalSeparator, '.');
  } else if (lastComma !== -1) {
    // A lone comma followed by 1-2 digits is a decimal comma; otherwise it groups thousands.
    cleaned = /,\d{1,2}$/.test(cleaned) && cleaned.split(',').length === 2
      ? cleaned.replace(',', '.')
      : cleaned.split(',').join('');
  } else if (cleaned.split('.').length > 2) {
    cleaned = cleaned.split('.').join('');
  }

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Accepts 0-1 or 0-100 scores and always returns 0-1 (or null). */
export function toConfidence(value) {
  const score = toNumber(value);
  if (score === null || score < 0) return null;
  return Math.min(score > 1 ? score / 100 : score, 1);
}

/** Copies every key of `source` that is not in `knownKeys`, optionally prefixing the key. */
export function collectUnknownFields(source, knownKeys, prefix = '') {
  if (!isPlainObject(source)) return {};
  return Object.fromEntries(
    Object.entries(source)
      .filter(([key]) => !knownKeys.includes(key))
      .map(([key, value]) => [prefix ? `${prefix}_${key}` : key, value]),
  );
}

/** Drops null / undefined confidence entries so the UI only shows real scores. */
export function compactConfidence(confidence) {
  return Object.fromEntries(Object.entries(confidence).filter(([, score]) => score !== null));
}
