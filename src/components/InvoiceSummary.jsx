import { EMPTY_VALUE, formatConfidence, formatDate, formatMoney, isMissing } from '../utils/format';

function SummaryStat({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">{children}</dd>
    </div>
  );
}

/** Header for a result. Shows backend values only: seller, invoice number and date, total, and
 * the due date and confidence when the backend has them. */
export default function InvoiceSummary({ invoice }) {
  const { details, seller, totals } = invoice;
  const stats = [];
  if ('dueDate' in details) stats.push({ label: 'Due date', value: formatDate(details.dueDate) });
  if (invoice.confidence !== null) stats.push({ label: 'Confidence', value: formatConfidence(invoice.confidence) });

  return (
    <section
      aria-label="Invoice summary"
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 bg-linear-to-br from-brand-50/80 to-transparent px-5 pt-5 pb-4 dark:from-brand-500/10">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-brand-700 uppercase dark:text-brand-300">Seller</p>
          <p className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-white">{seller.name ?? EMPTY_VALUE}</p>
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
            Invoice {details.invoiceNumber ?? EMPTY_VALUE} · {formatDate(details.invoiceDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">Total</p>
          <p
            className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${
              isMissing(totals.total) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatMoney(totals.total, details.currency)}
          </p>
        </div>
      </div>

      {stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          {stats.map(({ label, value }) => (
            <SummaryStat key={label} label={label}>
              {value}
            </SummaryStat>
          ))}
        </dl>
      )}
    </section>
  );
}
