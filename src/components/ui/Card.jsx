import { useId } from 'react';
import { cn } from '../../utils/cn';

export default function Card({ title, icon: Icon, actions, className, bodyClassName, children }) {
  const titleId = useId();
  const hasHeader = Boolean(title || actions);

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 transition-shadow duration-200 hover:shadow-md hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-none',
        className,
      )}
    >
      {hasHeader && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          {title && (
            <h2 id={titleId} className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {Icon && (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <span className="truncate">{title}</span>
            </h2>
          )}
          {actions}
        </header>
      )}
      <div className={cn('px-5 py-4', bodyClassName)}>{children}</div>
    </section>
  );
}
