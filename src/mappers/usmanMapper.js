import { REVIEW_STATUS } from './invoiceShape';
import { isPlainObject, toArray, toNumber, toObject, toText } from './mapperUtils';

/*
 * Usman's contract: app/schemas.py (InvoiceData), returned by POST /v1/extract.
 * Amounts and quantities are JSON numbers, dates are ISO strings, missing data is null.
 */

const STATUS_MAP = {
  ok: REVIEW_STATUS.OK,
  needs_review: REVIEW_STATUS.NEEDS_REVIEW,
};

/**
 * meta.llm_fields uses his paths ("invoice.due_date", "summary.amount_paid", "items");
 * this only renames them to the internal field names so the UI can find the field.
 */
function toInternalPath(path) {
  const camel = (value) => value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  const [section, field] = String(path).split('.');
  const sectionMap = { invoice: 'details', summary: 'totals', items: 'lineItems' };
  const fieldMap = { date: 'invoiceDate' };
  const internalSection = sectionMap[section] ?? section;
  if (!field) return internalSection;
  return `${internalSection}.${fieldMap[field] ?? camel(field)}`;
}

function mapParty(party) {
  const source = toObject(party);
  return {
    name: toText(source.name),
    address: toText(source.address),
    taxId: toText(source.tax_id),
    iban: toText(source.iban),
    email: toText(source.email),
  };
}

function mapLineItem(item) {
  const source = toObject(item);
  return {
    position: toNumber(source.line),
    description: toText(source.description),
    quantity: toNumber(source.quantity),
    unit: toText(source.unit),
    unitPrice: toNumber(source.unit_price),
    vatPercent: toNumber(source.vat_percent),
    netAmount: toNumber(source.net_amount),
    grossAmount: toNumber(source.gross_amount),
  };
}

function mapPayment(payment) {
  const source = toObject(payment);
  return {
    beneficiary: toText(source.beneficiary),
    bank: toText(source.bank),
    iban: toText(source.iban),
    bic: toText(source.bic),
    accountNumber: toText(source.account_number),
    reference: toText(source.reference),
  };
}

export function normalizeUsmanInvoice(data) {
  if (!isPlainObject(data) || !isPlainObject(data.meta)) {
    throw new TypeError("Expected an InvoiceData object (with meta) from Usman's backend.");
  }

  const invoice = toObject(data.invoice);
  const summary = toObject(data.summary);
  const meta = data.meta;

  return {
    status: STATUS_MAP[meta.status] ?? null,
    statusLabel: toText(meta.status),
    error: null,
    confidence: toNumber(meta.confidence),
    details: {
      invoiceNumber: toText(invoice.invoice_number),
      invoiceDate: toText(invoice.date),
      dueDate: toText(invoice.due_date),
      currency: toText(invoice.currency),
    },
    seller: mapParty(data.seller),
    client: mapParty(data.client),
    lineItems: toArray(data.items).map(mapLineItem),
    totals: {
      subtotal: toNumber(summary.subtotal),
      tax: toNumber(summary.tax),
      taxRate: toNumber(summary.tax_rate),
      discount: toNumber(summary.discount),
      otherCharges: toArray(summary.other_charges).map((charge) => ({
        label: toText(charge?.label),
        amount: toNumber(charge?.amount),
      })),
      total: toNumber(summary.total),
      amountPaid: toNumber(summary.amount_paid),
      amountDue: toNumber(summary.amount_due),
    },
    payment: mapPayment(data.payment),
    validation: [{ key: 'meta.warnings', items: toArray(meta.warnings).map(toText).filter(Boolean) }],
    aiFilledFields: toArray(meta.llm_fields).map(toInternalPath),
    processing: [
      { label: 'engine', value: toText(meta.engine) },
      { label: 'pages', value: toNumber(meta.pages) },
      { label: 'processing_ms', value: toNumber(meta.processing_ms) },
      { label: 'llm_used', value: typeof meta.llm_used === 'boolean' ? String(meta.llm_used) : null },
    ],
  };
}
