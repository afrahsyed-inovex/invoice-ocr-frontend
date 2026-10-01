import { cn } from '../utils/cn';
import Spinner from './ui/Spinner';

function SkeletonBlock({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800', className)} />;
}

function SkeletonCard({ rows }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2.5">
        <SkeletonBlock className="h-7 w-7 rounded-lg" />
        <SkeletonBlock className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <SkeletonBlock className="h-3 w-1/3" />
            <SkeletonBlock className="h-3 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Placeholder that mirrors the extracted-data layout while a request is in flight. */
export default function SkeletonLoader({ label }) {
  return (
    <div className="space-y-4" aria-busy="true">
      <div
        role="status"
        className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3.5 text-sm font-medium text-brand-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-100"
      >
        <Spinner />
        {label}
      </div>
      <SkeletonCard rows={4} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <SkeletonCard rows={4} />
        <SkeletonCard rows={2} />
      </div>
      <SkeletonCard rows={5} />
    </div>
  );
}
