import { CircleAlert, UploadCloud } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../utils/cn';
import { createLogger } from '../utils/logger';

const log = createLogger('upload');

/**
 * Drag-and-drop / click-to-browse for a single file. Type and size are not checked here:
 * the backend validates the upload and its own error is shown.
 */
export default function UploadZone({ onFileAccepted, disabled = false }) {
  const [error, setError] = useState(null);
  const hintId = useId();
  const errorId = useId();

  const handleDrop = useCallback(
    (acceptedFiles, rejections) => {
      // With multiple: false, dropping several files rejects all of them.
      if (rejections.length > 0 || acceptedFiles.length !== 1) {
        log.warn('More than one file dropped', { count: acceptedFiles.length + rejections.length });
        setError('Please upload one invoice at a time.');
        return;
      }

      const [file] = acceptedFiles;
      log.info('File selected', { name: file.name, type: file.type, sizeBytes: file.size });
      setError(null);
      onFileAccepted(file);
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    disabled,
  });

  return (
    <div>
      <div
        {...getRootProps({
          role: 'button',
          'aria-label': 'Upload an invoice: drag and drop a file here, or press Enter to browse',
          'aria-describedby': error ? `${hintId} ${errorId}` : hintId,
          'aria-disabled': disabled,
        })}
        className={cn(
          'group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200',
          isDragActive
            ? 'scale-[1.01] border-brand-500 bg-brand-50 dark:bg-brand-500/10'
            : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/5',
          error && !isDragActive && 'border-rose-300 dark:border-rose-500/50',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <input {...getInputProps({ 'aria-label': 'Invoice file' })} />
        <span
          className={cn(
            'grid h-14 w-14 place-items-center rounded-2xl transition-colors duration-200',
            isDragActive
              ? 'bg-brand-600 text-white'
              : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400',
          )}
        >
          <UploadCloud className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {isDragActive ? 'Drop the invoice to upload it' : 'Drag & drop your invoice here'}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          or <span className="font-medium text-brand-600 underline-offset-2 group-hover:underline dark:text-brand-400">click to browse</span>
        </p>
        <p id={hintId} className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          One file at a time
        </p>
      </div>

      {error && (
        <p id={errorId} role="alert" className="animate-fade-in mt-3 flex items-start gap-2 text-sm text-rose-600 dark:text-rose-400">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
