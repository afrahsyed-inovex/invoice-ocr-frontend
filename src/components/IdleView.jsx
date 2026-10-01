import { FileJson, ScanText, UploadCloud } from 'lucide-react';
import UploadZone from './UploadZone';

function getSteps(backendLabel) {
  return [
    { icon: UploadCloud, title: 'Upload', text: 'Drop an invoice file.' },
    { icon: ScanText, title: 'Extract', text: `${backendLabel}'s backend reads the fields.` },
    { icon: FileJson, title: 'Review & export', text: 'Check the values, then copy or download the JSON.' },
  ];
}

/** The starting screen of an upload page: upload area and a short how-it-works strip. */
export default function IdleView({ backendLabel, onFileAccepted }) {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-2 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
        <UploadZone onFileAccepted={onFileAccepted} />
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-3" aria-label="How it works">
        {getSteps(backendLabel).map(({ icon: Icon, title, text }, index) => (
          <li
            key={title}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors duration-200 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Step {index + 1}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
