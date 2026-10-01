import { ListOrdered } from 'lucide-react';
import { formatMoney, formatQuantity, formatText, isMissing } from '../utils/format';
import FieldValue from './FieldValue';
import Badge from './ui/Badge';
import Card from './ui/Card';

const COLUMNS = [
  { key: 'description', label: 'Description', align: 'left', format: formatText },
  { key: 'quantity', label: 'Qty', align: 'right', format: formatQuantity },
  { key: 'unitPrice', label: 'Unit price', align: 'right', format: formatMoney },
  { key: 'amount', label: 'Amount', align: 'right', format: formatMoney },
];

export default function LineItemsTable({ items, currency }) {
  const itemCountLabel = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;

  return (
    <Card title="Line items" icon={ListOrdered} actions={<Badge>{itemCountLabel}</Badge>} bodyClassName="p-0">
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
                <th scope="col" className="w-10 py-2.5 pr-2 pl-5 text-left font-medium">
                  #
                </th>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-3 py-2.5 font-medium whitespace-nowrap last:pr-5 ${column.align === 'right' ? 'text-right' : 'text-left'}`}
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
                  <td className="py-3 pr-2 pl-5 align-top text-slate-400 tabular-nums">{index + 1}</td>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={
                        column.align === 'right'
                          ? 'px-3 py-3 text-right align-top whitespace-nowrap tabular-nums last:pr-5'
                          : 'min-w-48 px-3 py-3 align-top'
                      }
                    >
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
