import { cn } from '../utils/cn';

/** Displays a formatted value; missing values render the muted "—" placeholder. */
export default function FieldValue({ display, isMissing, className }) {
  if (isMissing) {
    return (
      <span className={cn('text-slate-400 dark:text-slate-500', className)}>
        <span aria-hidden="true">{display}</span>
        <span className="sr-only">Not found</span>
      </span>
    );
  }

  // pre-line keeps the line breaks of multi-line addresses.
  return (
    <span className={cn('wrap-break-word whitespace-pre-line text-slate-900 dark:text-slate-100', className)}>{display}</span>
  );
}
