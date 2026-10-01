import { useRef } from 'react';
import { cn } from '../../utils/cn';

/**
 * Segmented tab list following the WAI-ARIA tabs pattern (arrow keys move between tabs).
 * The parent renders the panel with id `${idPrefix}-panel-${activeId}`.
 */
export default function Tabs({ tabs, activeId, onChange, idPrefix, label }) {
  const tabRefs = useRef({});

  const handleKeyDown = (event) => {
    const direction = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!direction) return;

    event.preventDefault();
    const currentIndex = tabs.findIndex((tab) => tab.id === activeId);
    const next = tabs[(currentIndex + direction + tabs.length) % tabs.length];
    onChange(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70">
      {tabs.map(({ id, label: tabLabel, icon: Icon }) => {
        const isActive = id === activeId;
        return (
          <button
            key={id}
            ref={(node) => {
              tabRefs.current[id] = node;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${id}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={handleKeyDown}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
              isActive
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {tabLabel}
          </button>
        );
      })}
    </div>
  );
}
