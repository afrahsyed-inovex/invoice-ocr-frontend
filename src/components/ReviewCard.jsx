import { ClipboardCheck } from 'lucide-react';
import Card from './ui/Card';

/**
 * The backend's own validation output, under the backend's own field name — currently
 * Usman's meta.warnings codes, shown exactly as returned. Nothing is added or interpreted.
 */
export default function ReviewCard({ validation }) {
  const lists = validation.filter((list) => list.items.length > 0);
  if (lists.length === 0) return null;

  return (
    <Card title="Validation" icon={ClipboardCheck} bodyClassName="divide-y divide-slate-100 px-5 py-1 dark:divide-slate-800">
      {lists.map((list) => (
        <section key={list.key} aria-label={list.key} className="py-3">
          <h3 className="mb-2 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
            {list.key} ({list.items.length})
          </h3>
          <ul className="flex flex-wrap gap-2">
            {list.items.map((code, index) => (
              <li key={index}>
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {code}
                </code>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Card>
  );
}
