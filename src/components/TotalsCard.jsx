import { Calculator } from 'lucide-react';
import { formatMoney, formatPercent, isMissing } from '../utils/format';
import AiFilledBadge from './AiFilledBadge';
import FieldValue from './FieldValue';
import Card from './ui/Card';

/** Every totals field a backend returns, in invoice order; null values show "—". */
const ROWS = [
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'discount', label: 'Discount' },
  { key: 'taxRate', label: 'Tax rate', format: formatPercent },
  { key: 'tax', label: 'Tax' },
];

const TRAILING_ROWS = [
  { key: 'amountPaid', label: 'Amount paid' },
  { key: 'amountDue', label: 'Amount due' },
];

function TotalsRow({ label, display, isMissing: missing, isAiFilled, className }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="flex items-center gap-2 tabular-nums">
        {isAiFilled && <AiFilledBadge />}
        <FieldValue display={display} isMissing={missing} className={className} />
      </dd>
    </div>
  );
}

export default function TotalsCard({ totals, currency, aiFilledFields }) {
  const money = (value) => formatMoney(value, currency);
  const toRow = ({ key, label, format = money }) =>
    key in totals && (
      <TotalsRow
        key={key}
        label={label}
        display={format(totals[key])}
        isMissing={isMissing(totals[key])}
        isAiFilled={aiFilledFields.includes(`totals.${key}`)}
      />
    );

  return (
    <Card title="Totals" icon={Calculator}>
      <dl className="space-y-2.5 text-sm">
        {ROWS.map(toRow)}
        {(totals.otherCharges ?? []).map((charge, index) => (
          <TotalsRow
            key={`charge-${index}`}
            label={charge.label ?? 'other_charges'}
            display={money(charge.amount)}
            isMissing={isMissing(charge.amount)}
          />
        ))}

        <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
          <TotalsRow
            label="Total"
            display={money(totals.total)}
            isMissing={isMissing(totals.total)}
            isAiFilled={aiFilledFields.includes('totals.total')}
            className="text-lg font-semibold"
          />
        </div>

        {TRAILING_ROWS.map(toRow)}
      </dl>
    </Card>
  );
}
