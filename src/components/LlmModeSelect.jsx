import { Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Chooses Usman's ?llm= parameter for the next upload. "Default" sends no parameter,
 * so his backend uses LLM_MODE from its .env.
 */
export default function LlmModeSelect({ modes, value, onChange }) {
  const options = [{ value: '', label: 'Default' }, ...modes.map((mode) => ({ value: mode, label: mode }))];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
      <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
        <Sparkles className="h-4 w-4 text-brand-500" aria-hidden="true" />
        AI fallback
      </span>
      <div role="group" aria-label="AI fallback mode" className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
              value === option.value
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
