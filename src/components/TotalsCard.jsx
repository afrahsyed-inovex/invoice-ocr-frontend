import { Calculator } from 'lucide-react';
import { formatMoney, isMissing } from '../utils/format';
import ConfidenceBadge from './ConfidenceBadge';
import FieldValue from './FieldValue';
import Card from './ui/Card';

const SECONDARY_TOTALS = [
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'tax', label: 'Tax' },
];

export default function TotalsCard({ invoice }) {
  const { currency, confidence } = invoice;

  return (
    <Card title="Totals" icon={Calculator}>
      <dl className="space-y-2.5 text-sm">
        {SECONDARY_TOTALS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="flex items-center gap-2 tabular-nums">
              <ConfidenceBadge value={confidence[key]} />
              <FieldValue display={formatMoney(invoice[key], currency)} isMissing={isMissing(invoice[key])} />
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <dt className="font-semibold text-slate-900 dark:text-slate-100">Total</dt>
          <dd className="flex items-center gap-2 tabular-nums">
            <ConfidenceBadge value={confidence.total} />
            <FieldValue
              display={formatMoney(invoice.total, currency)}
              isMissing={isMissing(invoice.total)}
              className="text-lg font-semibold"
            />
          </dd>
        </div>
      </dl>
    </Card>
  );
}
