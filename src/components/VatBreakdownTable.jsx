import { Percent } from 'lucide-react';
import { formatMoney, formatPercent, isMissing } from '../utils/format';
import FieldValue from './FieldValue';
import Card from './ui/Card';

const COLUMNS = [
  { key: 'vatRate', label: 'VAT rate', format: formatPercent },
  { key: 'netAmount', label: 'Net worth', format: formatMoney },
  { key: 'vat', label: 'VAT', format: formatMoney },
  { key: 'grossAmount', label: 'Gross worth', format: formatMoney },
];

/** The per-VAT-rate SUMMARY table that Munhim's backend reads from the invoice. */
export default function VatBreakdownTable({ rows, currency }) {
  return (
    <Card title="VAT summary" icon={Percent} bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">VAT summary by rate</caption>
          <thead>
            <tr className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase dark:bg-slate-800/50 dark:text-slate-400">
              {COLUMNS.map((column) => (
                <th key={column.key} scope="col" className="px-3 py-2.5 text-right font-medium whitespace-nowrap first:pl-5 last:pr-5">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, index) => (
              <tr key={index}>
                {COLUMNS.map((column) => (
                  <td key={column.key} className="px-3 py-3 text-right whitespace-nowrap tabular-nums first:pl-5 last:pr-5">
                    <FieldValue display={column.format(row[column.key], currency)} isMissing={isMissing(row[column.key])} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
