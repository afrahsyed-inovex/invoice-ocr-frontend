import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { cn } from '../utils/cn';

const VARIANTS = {
  success: {
    icon: CircleCheck,
    role: 'status',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  partial: {
    icon: TriangleAlert,
    role: 'status',
    classes: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    icon: CircleAlert,
    role: 'alert',
    classes: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
    iconClass: 'text-rose-600 dark:text-rose-400',
  },
  info: {
    icon: Info,
    role: 'status',
    classes: 'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-100',
    iconClass: 'text-brand-600 dark:text-brand-400',
  },
};

export default function StatusBanner({ variant = 'info', title, message, children, className }) {
  const { icon: Icon, role, classes, iconClass } = VARIANTS[variant];

  return (
    <div role={role} className={cn('animate-fade-in rounded-2xl border px-4 py-3.5', classes, className)}>
      <div className="flex gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {message && <p className="mt-0.5 text-sm opacity-90">{message}</p>}
          {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
