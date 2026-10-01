import { isMissing } from '../utils/format';

export const INVOICE_STATUS = {
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILED: 'failed',
};

/** Fields an extraction needs before it counts as complete (anything missing makes it "partial"). */
const KEY_FIELDS = [
  { path: ['invoiceNumber'], label: 'Invoice number' },
  { path: ['invoiceDate'], label: 'Invoice date' },
  { path: ['vendor', 'name'], label: 'Vendor name' },
  { path: ['customer', 'name'], label: 'Customer name' },
  { path: ['total'], label: 'Total' },
];

const SCALAR_FIELDS = ['invoiceNumber', 'invoiceDate', 'dueDate', 'currency', 'subtotal', 'tax', 'total'];

/** The one internal shape every UI component works with, regardless of backend. */
export function createEmptyInvoice() {
  return {
    invoiceNumber: null,
    invoiceDate: null,
    dueDate: null,
    currency: null,
    vendor: { name: null, address: null, email: null, phone: null },
    customer: { name: null, address: null },
    lineItems: [],
    subtotal: null,
    tax: null,
    total: null,
    confidence: {},
    extra: {},
    status: INVOICE_STATUS.FAILED,
  };
}

function readPath(source, path) {
  return path.reduce((value, key) => value?.[key], source);
}

export function getMissingKeyFields(invoice) {
  const missing = KEY_FIELDS.filter(({ path }) => isMissing(readPath(invoice, path))).map(
    ({ label }) => label,
  );
  if (invoice.lineItems.length === 0) missing.push('Line items');
  return missing;
}

function hasExtractedData(invoice) {
  const parties = [invoice.vendor, invoice.customer];
  return (
    SCALAR_FIELDS.some((field) => !isMissing(invoice[field])) ||
    parties.some((party) => Object.values(party).some((value) => !isMissing(value))) ||
    invoice.lineItems.length > 0
  );
}

/**
 * Combines what the frontend can see with what the backend reported, keeping the worse
 * of the two: a backend may say "success" while key fields are empty, or flag a failure itself.
 */
export function resolveStatus(invoice, reportedStatus) {
  if (!hasExtractedData(invoice) || reportedStatus === INVOICE_STATUS.FAILED) {
    return INVOICE_STATUS.FAILED;
  }
  if (getMissingKeyFields(invoice).length > 0 || reportedStatus === INVOICE_STATUS.PARTIAL) {
    return INVOICE_STATUS.PARTIAL;
  }
  return INVOICE_STATUS.SUCCESS;
}
