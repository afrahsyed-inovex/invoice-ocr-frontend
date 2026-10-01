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
 * Expected (provisional) Munhim response — flat snake_case with a separate confidence map:
 * {
 *   invoice_no, invoice_date, due_date, currency,
 *   seller: { name, address, email, phone, ... }, buyer: { name, address, ... },
 *   items: [{ description, qty, unit_price, total }],
 *   subtotal, tax, total, status, confidence_scores: { invoice_no: 0.98, seller_name: 0.9, ... }
 * }
 * Update this file when the real contract is final; the UI will not need to change.
 */

const KNOWN_TOP_LEVEL_KEYS = [
  'invoice_no',
  'invoice_date',
  'due_date',
  'currency',
  'seller',
  'buyer',
  'items',
  'subtotal',
  'tax',
  'total',
  'status',
  'confidence_scores',
];
const KNOWN_SELLER_KEYS = ['name', 'address', 'email', 'phone'];
const KNOWN_BUYER_KEYS = ['name', 'address'];

/** Munhim confidence key -> internal field path. */
const CONFIDENCE_KEY_MAP = {
  invoice_no: 'invoiceNumber',
  invoice_date: 'invoiceDate',
  due_date: 'dueDate',
  currency: 'currency',
  seller_name: 'vendor.name',
  seller_address: 'vendor.address',
  seller_email: 'vendor.email',
  seller_phone: 'vendor.phone',
  buyer_name: 'customer.name',
  buyer_address: 'customer.address',
  subtotal: 'subtotal',
  tax: 'tax',
  total: 'total',
};

const STATUS_MAP = { ok: 'success', success: 'success', partial: 'partial', error: 'failed', failed: 'failed' };

function mapLineItem(item) {
  const source = isPlainObject(item) ? item : {};
  return {
    description: toText(source.description),
    quantity: toNumber(source.qty),
    unitPrice: toNumber(source.unit_price),
    amount: toNumber(source.total),
  };
}

function mapConfidence(scores) {
  if (!isPlainObject(scores)) return {};
  const mapped = Object.entries(CONFIDENCE_KEY_MAP).map(([sourceKey, fieldPath]) => [
    fieldPath,
    toConfidence(scores[sourceKey]),
  ]);
  return compactConfidence(Object.fromEntries(mapped));
}

export function normalizeMunhimInvoice(raw) {
  if (!isPlainObject(raw)) {
    throw new TypeError(`Expected a JSON object from Munhim's backend, received ${typeof raw}.`);
  }

  const seller = isPlainObject(raw.seller) ? raw.seller : {};
  const buyer = isPlainObject(raw.buyer) ? raw.buyer : {};

  const invoice = {
    ...createEmptyInvoice(),
    invoiceNumber: toText(raw.invoice_no),
    invoiceDate: toText(raw.invoice_date),
    dueDate: toText(raw.due_date),
    currency: toText(raw.currency),
    vendor: {
      name: toText(seller.name),
      address: toText(seller.address),
      email: toText(seller.email),
      phone: toText(seller.phone),
    },
    customer: {
      name: toText(buyer.name),
      address: toText(buyer.address),
    },
    lineItems: Array.isArray(raw.items) ? raw.items.map(mapLineItem) : [],
    subtotal: toNumber(raw.subtotal),
    tax: toNumber(raw.tax),
    total: toNumber(raw.total),
    confidence: mapConfidence(raw.confidence_scores),
    extra: {
      ...collectUnknownFields(raw, KNOWN_TOP_LEVEL_KEYS),
      ...collectUnknownFields(seller, KNOWN_SELLER_KEYS, 'vendor'),
      ...collectUnknownFields(buyer, KNOWN_BUYER_KEYS, 'customer'),
    },
  };

  const reportedStatus = STATUS_MAP[String(raw.status ?? '').toLowerCase()];
  return { ...invoice, status: resolveStatus(invoice, reportedStatus) };
}
