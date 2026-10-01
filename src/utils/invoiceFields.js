import { formatDate, formatDateTime, formatText, isMissing } from './format';

/*
 * Turns sections of the normalized invoice into display rows for FieldCard:
 * { id, label, display, isMissing, isAiFilled }.
 * Only keys present on the section are shown: a backend that never provides a field
 * (for example Munhim has no due date) simply has no row for it.
 */

export const DETAIL_LABELS = {
  invoiceNumber: 'Invoice number',
  invoiceDate: 'Invoice date',
  dueDate: 'Due date',
  currency: 'Currency',
};

export const PARTY_LABELS = {
  name: 'Name',
  address: 'Address',
  taxId: 'Tax ID',
  iban: 'IBAN',
  email: 'Email',
};

export const PAYMENT_LABELS = {
  beneficiary: 'Beneficiary',
  bank: 'Bank',
  iban: 'IBAN',
  bic: 'BIC',
  accountNumber: 'Account number',
  reference: 'Reference',
};

const FORMATTERS = {
  invoiceDate: formatDate,
  dueDate: formatDate,
};

export function buildFieldRows(sectionKey, values, labels, aiFilledFields = []) {
  if (!values) return [];
  return Object.entries(labels)
    .filter(([key]) => key in values)
    .map(([key, label]) => {
      const value = values[key];
      const format = FORMATTERS[key] ?? formatText;
      return {
        id: `${sectionKey}.${key}`,
        label,
        display: format(value),
        isMissing: isMissing(value),
        isAiFilled: aiFilledFields.includes(`${sectionKey}.${key}`),
      };
    });
}

/** Processing details are already { label, value } pairs from the mapper. */
export function buildProcessingRows(processing) {
  return processing.map(({ label, value, kind }) => ({
    id: `processing.${label}`,
    label,
    display: kind === 'datetime' ? formatDateTime(value) : formatText(value),
    isMissing: isMissing(value),
    isAiFilled: false,
  }));
}
