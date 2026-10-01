import { formatDate, formatText, humanizeKey, isComplexValue, isMissing } from './format';

/*
 * Turns parts of the normalized invoice into display rows for FieldCard:
 * { id, label, display, isMissing, isComplex, confidence }.
 */

const DETAIL_FIELDS = [
  { key: 'invoiceNumber', label: 'Invoice number' },
  { key: 'invoiceDate', label: 'Invoice date', formatter: formatDate },
  { key: 'dueDate', label: 'Due date', formatter: formatDate },
  { key: 'currency', label: 'Currency' },
];

const PARTY_FIELD_LABELS = {
  name: 'Name',
  address: 'Address',
  email: 'Email',
  phone: 'Phone',
};

function createRow({ id, label, value, confidence, formatter = formatText }) {
  return {
    id,
    label,
    display: formatter(value),
    isMissing: isMissing(value),
    isComplex: isComplexValue(value),
    confidence: confidence ?? null,
  };
}

export function buildDetailRows(invoice) {
  return DETAIL_FIELDS.map(({ key, label, formatter }) =>
    createRow({ id: key, label, value: invoice[key], confidence: invoice.confidence[key], formatter }),
  );
}

/** Renders every key of a party object, so fields added to the shape later show up automatically. */
export function buildPartyRows(party, partyKey, confidence) {
  return Object.entries(party).map(([key, value]) =>
    createRow({
      id: `${partyKey}.${key}`,
      label: PARTY_FIELD_LABELS[key] ?? humanizeKey(key),
      value,
      confidence: confidence[`${partyKey}.${key}`],
    }),
  );
}

export function buildExtraRows(extra) {
  return Object.entries(extra).map(([key, value]) =>
    createRow({ id: `extra.${key}`, label: humanizeKey(key), value }),
  );
}
