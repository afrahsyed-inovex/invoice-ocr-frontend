import AiFilledBadge from './AiFilledBadge';
import FieldValue from './FieldValue';
import Card from './ui/Card';

/** A titled card listing label/value rows built by utils/invoiceFields. */
export default function FieldCard({ title, icon, rows, className }) {
  if (rows.length === 0) return null;

  return (
    <Card title={title} icon={icon} className={className} bodyClassName="px-5 py-1">
      <dl className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-3">
            <dt className="text-xs font-medium text-slate-500 sm:pt-0.5 dark:text-slate-400">{row.label}</dt>
            <dd className="flex min-w-0 items-start justify-between gap-2 text-sm">
              <div className="min-w-0 flex-1">
                <FieldValue display={row.display} isMissing={row.isMissing} />
              </div>
              {row.isAiFilled && <AiFilledBadge />}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
