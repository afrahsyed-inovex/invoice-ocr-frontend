import { ListOrdered } from 'lucide-react';
import { formatMoney, formatPercent, formatQuantity, formatText, isMissing } from '../utils/format';
import AiFilledBadge from './AiFilledBadge';
import FieldValue from './FieldValue';
import Badge from './ui/Badge';
import Card from './ui/Card';

const COLUMNS = [
  { key: 'position', label: 'No.', align: 'left', format: formatText },
  { key: 'description', label: 'Description', align: 'left', format: formatText, wide: true },
  { key: 'quantity', label: 'Qty', align: 'right', format: formatQuantity },
  { key: 'unit', label: 'Unit', align: 'left', format: formatText },
  { key: 'unitPrice', label: 'Unit price', align: 'right', format: formatMoney },
  { key: 'netAmount', label: 'Net', align: 'right', format: formatMoney },
  { key: 'vatPercent', label: 'VAT', align: 'right', format: formatPercent },
  { key: 'grossAmount', label: 'Gross', align: 'right', format: formatMoney },
];

function cellClass(column) {
  if (column.wide) return 'min-w-48 px-3 py-3 align-top first:pl-5 last:pr-5';
  const align = column.align === 'right' ? 'text-right' : 'text-left';
  return `px-3 py-3 align-top whitespace-nowrap tabular-nums first:pl-5 last:pr-5 ${align}`;
}

export default function LineItemsTable({ items, currency, isAiFilled }) {
  // Every column is always shown; values the backend returned as null show "—".
  const columns = COLUMNS;
  const itemCountLabel = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;

  return (
    <Card
      title="Line items"
      icon={ListOrdered}
      actions={
        <span className="flex items-center gap-2">
          {isAiFilled && <AiFilledBadge />}
          <Badge>{itemCountLabel}</Badge>
        </span>
      }
      bodyClassName="p-0"
    >
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No line items were detected on this invoice.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-lg text-sm">
            <caption className="sr-only">Invoice line items</caption>
            <thead>
              <tr className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase dark:bg-slate-800/50 dark:text-slate-400">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-3 py-2.5 font-medium whitespace-nowrap first:pl-5 last:pr-5 ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, index) => (
                // Line items have no stable id, and the list never reorders.
                <tr key={index} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  {columns.map((column) => (
                    <td key={column.key} className={cellClass(column)}>
                      <FieldValue display={column.format(item[column.key], currency)} isMissing={isMissing(item[column.key])} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
