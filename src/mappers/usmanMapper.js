import { createEmptyInvoice, resolveStatus } from './invoiceShape';
import {
  collectUnknownFields,
  compactConfidence,
  isPlainObject,
  toConfidence,
  toNumber,
  toText,
} from './mapperUtils';

/*
 * Expected (provisional) Usman response — every field carries its own confidence:
 * {
 *   status: "succeeded" | "partial" | "failed",
 *   fields: { InvoiceId: { value, confidence }, VendorName: { value, confidence }, ... },
 *   line_items: [{ Description: { value, confidence }, Quantity, UnitPrice, Amount }],
 *   ...metadata (model_version, processing_time_ms, ...)
 * }
 * Update this file when the real contract is final; the UI will not need to change.
 */

const KNOWN_TOP_LEVEL_KEYS = ['status', 'fields', 'line_items'];

/** Usman field name -> internal field path and value type. */
const FIELD_MAP = {
  InvoiceId: { path: 'invoiceNumber', type: 'text' },
  InvoiceDate: { path: 'invoiceDate', type: 'text' },
  DueDate: { path: 'dueDate', type: 'text' },
  Currency: { path: 'currency', type: 'text' },
  VendorName: { path: 'vendor.name', type: 'text' },
  VendorAddress: { path: 'vendor.address', type: 'text' },
  VendorEmail: { path: 'vendor.email', type: 'text' },
  VendorPhone: { path: 'vendor.phone', type: 'text' },
  CustomerName: { path: 'customer.name', type: 'text' },
  CustomerAddress: { path: 'customer.address', type: 'text' },
  SubTotal: { path: 'subtotal', type: 'number' },
  TotalTax: { path: 'tax', type: 'number' },
  InvoiceTotal: { path: 'total', type: 'number' },
};

const STATUS_MAP = { succeeded: 'success', success: 'success', partial: 'partial', failed: 'failed' };

/** Fields arrive as { value, confidence }, but a bare value is tolerated too. */
function readField(field) {
  if (isPlainObject(field) && 'value' in field) {
    return { value: field.value, confidence: toConfidence(field.confidence) };
  }
  return { value: field, confidence: null };
}

function convert(value, type) {
  return type === 'number' ? toNumber(value) : toText(value);
}

function assignPath(target, path, value) {
  const [head, tail] = path.split('.');
  if (tail) target[head] = { ...target[head], [tail]: value };
  else target[head] = value;
}

function mapLineItem(item) {
  const source = isPlainObject(item) ? item : {};
  return {
    description: toText(readField(source.Description).value),
    quantity: toNumber(readField(source.Quantity).value),
    unitPrice: toNumber(readField(source.UnitPrice).value),
    amount: toNumber(readField(source.Amount).value),
  };
}

export function normalizeUsmanInvoice(raw) {
  if (!isPlainObject(raw)) {
    throw new TypeError(`Expected a JSON object from Usman's backend, received ${typeof raw}.`);
  }

  const fields = isPlainObject(raw.fields) ? raw.fields : {};
  const invoice = createEmptyInvoice();
  const confidence = {};
  const unknownFields = {};

  Object.entries(fields).forEach(([fieldName, field]) => {
    const { value, confidence: score } = readField(field);
    const mapping = FIELD_MAP[fieldName];

    if (!mapping) {
      unknownFields[fieldName] = value;
      return;
    }
    assignPath(invoice, mapping.path, convert(value, mapping.type));
    confidence[mapping.path] = score;
  });

  invoice.lineItems = Array.isArray(raw.line_items) ? raw.line_items.map(mapLineItem) : [];
  invoice.confidence = compactConfidence(confidence);
  invoice.extra = { ...unknownFields, ...collectUnknownFields(raw, KNOWN_TOP_LEVEL_KEYS) };

  const reportedStatus = STATUS_MAP[String(raw.status ?? '').toLowerCase()];
  return { ...invoice, status: resolveStatus(invoice, reportedStatus) };
}
