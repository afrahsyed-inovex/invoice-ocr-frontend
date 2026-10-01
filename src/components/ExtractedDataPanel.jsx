import { Building2, FileText, Layers, UserRound } from 'lucide-react';
import { buildDetailRows, buildExtraRows, buildPartyRows } from '../utils/invoiceFields';
import FieldCard from './FieldCard';
import LineItemsTable from './LineItemsTable';
import TotalsCard from './TotalsCard';

/** All extracted data for one normalized invoice. */
export default function ExtractedDataPanel({ invoice }) {
  const extraRows = buildExtraRows(invoice.extra);

  return (
    <div className="animate-fade-in space-y-4">
      <FieldCard title="Invoice details" icon={FileText} rows={buildDetailRows(invoice)} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <FieldCard title="Vendor" icon={Building2} rows={buildPartyRows(invoice.vendor, 'vendor', invoice.confidence)} />
        <FieldCard
          title="Customer"
          icon={UserRound}
          rows={buildPartyRows(invoice.customer, 'customer', invoice.confidence)}
        />
      </div>

      <LineItemsTable items={invoice.lineItems} currency={invoice.currency} />
      <TotalsCard invoice={invoice} />

      {extraRows.length > 0 && <FieldCard title="Other fields" icon={Layers} rows={extraRows} />}
    </div>
  );
}
