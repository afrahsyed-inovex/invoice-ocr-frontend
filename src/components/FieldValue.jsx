import { cn } from '../utils/cn';

/** Displays a formatted value; missing values render the muted "—" placeholder. */
export default function FieldValue({ display, isMissing, isComplex, className }) {
  if (isMissing) {
    return (
      <span className={cn('text-slate-400 dark:text-slate-500', className)}>
        <span aria-hidden="true">{display}</span>
        <span className="sr-only">Not found</span>
      </span>
    );
  }

  if (isComplex) {
    return (
      <pre className="max-h-48 overflow-auto rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
        {display}
      </pre>
    );
  }

  return <span className={cn('break-words text-slate-900 dark:text-slate-100', className)}>{display}</span>;
}
