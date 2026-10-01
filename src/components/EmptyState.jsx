export default function EmptyState({ icon: Icon, title, message, children }) {
  return (
    <div className="animate-fade-in flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      {message && <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
