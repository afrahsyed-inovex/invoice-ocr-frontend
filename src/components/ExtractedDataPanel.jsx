import { Building2, Cog, FileText, Landmark, UserRound } from 'lucide-react';
import {
  DETAIL_LABELS,
  PARTY_LABELS,
  PAYMENT_LABELS,
  buildFieldRows,
  buildProcessingRows,
} from '../utils/invoiceFields';
import FieldCard from './FieldCard';
import LineItemsTable from './LineItemsTable';
import ReviewCard from './ReviewCard';
import TotalsCard from './TotalsCard';
import VatBreakdownTable from './VatBreakdownTable';

/** All extracted data for one normalized invoice. Sections a backend doesn't have are skipped. */
export default function ExtractedDataPanel({ invoice }) {
  const { aiFilledFields, details } = invoice;

  return (
    <div className="animate-fade-in space-y-4">
      <ReviewCard validation={invoice.validation} />

      <FieldCard title="Invoice details" icon={FileText} rows={buildFieldRows('details', details, DETAIL_LABELS, aiFilledFields)} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <FieldCard title="Seller" icon={Building2} rows={buildFieldRows('seller', invoice.seller, PARTY_LABELS, aiFilledFields)} />
        <FieldCard title="Client" icon={UserRound} rows={buildFieldRows('client', invoice.client, PARTY_LABELS, aiFilledFields)} />
      </div>

      <LineItemsTable
        items={invoice.lineItems}
        currency={details.currency}
        isAiFilled={aiFilledFields.includes('lineItems')}
      />
      {invoice.vatBreakdown && <VatBreakdownTable rows={invoice.vatBreakdown} currency={details.currency} />}
      <TotalsCard totals={invoice.totals} currency={details.currency} aiFilledFields={aiFilledFields} />

      {invoice.payment && (
        <FieldCard title="Payment" icon={Landmark} rows={buildFieldRows('payment', invoice.payment, PAYMENT_LABELS, aiFilledFields)} />
      )}
      <FieldCard title="Processing" icon={Cog} rows={buildProcessingRows(invoice.processing)} />
    </div>
  );
}
