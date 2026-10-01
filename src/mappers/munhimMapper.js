import { REVIEW_STATUS } from './invoiceShape';
import { isPlainObject, toArray, toNumber, toObject, toText } from './mapperUtils';

/*
 * Munhim's contract: invoice_pipeline/models.py (InvoiceRecord, schema_version "1.0").
 * Money, quantities and VAT rates arrive as decimal strings ("1283.40"); dates are ISO.
 * His issues / empty_fields / repairs are not shown in the cards (they remain in the Raw JSON tab).
 */

const STATUS_MAP = {
  clean: REVIEW_STATUS.OK,
  needs_review: REVIEW_STATUS.NEEDS_REVIEW,
  failed: REVIEW_STATUS.FAILED,
};

function mapParty(party) {
  const source = toObject(party);
  const addressLines = toArray(source.address_lines).map(toText).filter(Boolean);
  return {
    name: toText(source.name),
    address: addressLines.length > 0 ? addressLines.join('\n') : null,
    taxId: toText(source.tax_id),
    iban: toText(source.iban),
  };
}

function mapLineItem(item) {
  const source = toObject(item);
  return {
    position: toNumber(source.no),
    description: toText(source.description),
    quantity: toNumber(source.quantity),
    unit: toText(source.unit),
    unitPrice: toNumber(source.net_price),
    vatPercent: toNumber(source.vat_rate),
    netAmount: toNumber(source.net_worth),
    grossAmount: toNumber(source.gross_worth),
  };
}

function mapVatRow(row) {
  const source = toObject(row);
  return {
    vatRate: toNumber(source.vat_rate),
    netAmount: toNumber(source.net_worth),
    vat: toNumber(source.vat),
    grossAmount: toNumber(source.gross_worth),
  };
}

export function normalizeMunhimInvoice(record) {
  if (!isPlainObject(record)) {
    throw new TypeError(`Expected a JSON object from Munhim's backend, received ${typeof record}.`);
  }
  const totals = toObject(record.totals);

  return {
    status: STATUS_MAP[record.status] ?? null,
    statusLabel: toText(record.status),
    error: toText(record.error),
    confidence: null,
    details: {
      invoiceNumber: toText(record.invoice_number),
      invoiceDate: toText(record.date_of_issue),
      currency: toText(record.currency_symbol),
    },
    seller: mapParty(record.seller),
    client: mapParty(record.client),
    lineItems: toArray(record.items).map(mapLineItem),
    totals: {
      subtotal: toNumber(totals.net_worth),
      tax: toNumber(totals.vat),
      total: toNumber(totals.gross_worth),
    },
    vatBreakdown: toArray(record.summary_rows).map(mapVatRow),
    validation: [],
    aiFilledFields: [],
    processing: [
      { label: 'id', value: toText(record.id) },
      { label: 'source_file', value: toText(record.source_file) },
      { label: 'ocr_engine', value: toText(record.ocr_engine) },
      { label: 'processed_at', value: toText(record.processed_at), kind: 'datetime' },
    ],
  };
}
