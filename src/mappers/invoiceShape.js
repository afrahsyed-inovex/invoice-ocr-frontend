/*
 * The one internal invoice shape every UI component reads. Each backend's mapper fills it
 * from that backend's response — values are copied, never inferred or calculated.
 *
 * Convention: a key that is ABSENT means the backend has no such field, so the UI hides it.
 * A key set to null means the backend has the field but returned null ("—").
 *
 * {
 *   status: 'ok' | 'needs_review' | 'failed' | null,   backend status, null if unrecognised
 *   statusLabel: string | null,              the backend's own status value ("clean", "ok"...)
 *   error: string | null,                    failure reason (Munhim, status "failed")
 *   confidence: number | null,               meta.confidence (Usman only)
 *   details:  { invoiceNumber, invoiceDate, dueDate?, currency },
 *   seller:   { name, address, taxId, iban, email? },
 *   client:   { name, address, taxId, iban, email? },
 *   lineItems: [{ position, description, quantity, unit, unitPrice, vatPercent, netAmount, grossAmount }],
 *   totals:   { subtotal, tax, total, taxRate?, discount?, otherCharges?, amountPaid?, amountDue? },
 *   vatBreakdown?: [{ vatRate, netAmount, vat, grossAmount }],          (Munhim summary_rows)
 *   payment?: { beneficiary, bank, iban, bic, accountNumber, reference }, (Usman)
 *   validation: [{ key, items }],   the backend's own lists, under their own names:
 *                                    Usman: meta.warnings (Munhim: none shown)
 *   aiFilledFields: ['seller.name', 'lineItems', ...],                 (Usman meta.llm_fields)
 *   processing: [{ label, value, kind? }],
 * }
 */

export const REVIEW_STATUS = {
  OK: 'ok',
  NEEDS_REVIEW: 'needs_review',
  FAILED: 'failed',
};
