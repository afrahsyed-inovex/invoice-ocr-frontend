import { ScanText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { USE_MOCK } from '../api/config';
import { NAV_ITEMS } from '../routes';
import { cn } from '../utils/cn';
import ThemeToggle from './ThemeToggle';
import Badge from './ui/Badge';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex shrink-0 items-center gap-2.5 rounded-lg" aria-label="Invoice OCR Studio home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
            <ScanText className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:inline dark:text-white">
            Invoice OCR <span className="text-brand-600 dark:text-brand-400">Studio</span>
          </span>
        </NavLink>

        <nav aria-label="Extraction pages" className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 sm:px-4',
                  isActive
                    ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {USE_MOCK && (
            <Badge tone="warning" title="Responses come from bundled mock data (VITE_USE_MOCK=true)">
              Mock mode
            </Badge>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
