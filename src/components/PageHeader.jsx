import { useEffect } from 'react';

/** Page title and description. */
export default function PageHeader({ title, description }) {
  useEffect(() => {
    document.title = `${title} · Invoice OCR Studio`;
  }, [title]);

  return (
    <div className="mb-8 min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
