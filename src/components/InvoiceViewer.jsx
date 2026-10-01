import { ExternalLink, FileImage, FileText, ImageOff, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { isPdfFile } from '../utils/fileValidation';
import { formatFileSize } from '../utils/format';
import { createLogger } from '../utils/logger';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Card from './ui/Card';

const log = createLogger('viewer');

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

const VIEWPORT_CLASSES = 'rounded-xl bg-slate-100 dark:bg-slate-950';
// Images shrink to fit their content up to a cap; the PDF viewer needs a fixed height.
const IMAGE_VIEWPORT_CLASSES = `${VIEWPORT_CLASSES} max-h-[55vh] lg:max-h-[calc(100vh-14rem)]`;
const PDF_VIEWPORT_CLASSES = `${VIEWPORT_CLASSES} h-[55vh] min-h-80 lg:h-[calc(100vh-14rem)]`;

function ZoomControls({ zoom, onZoomChange }) {
  const clamp = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Zoom controls">
      <Button
        variant="ghost"
        size="icon"
        icon={ZoomOut}
        aria-label="Zoom out"
        disabled={zoom <= MIN_ZOOM}
        onClick={() => onZoomChange(clamp(zoom - ZOOM_STEP))}
      />
      <button
        type="button"
        onClick={() => onZoomChange(1)}
        className="min-w-14 rounded-md px-1.5 py-1 text-xs font-medium text-slate-600 tabular-nums transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label={`Current zoom ${Math.round(zoom * 100)}%. Reset to 100%`}
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <Button
        variant="ghost"
        size="icon"
        icon={ZoomIn}
        aria-label="Zoom in"
        disabled={zoom >= MAX_ZOOM}
        onClick={() => onZoomChange(clamp(zoom + ZOOM_STEP))}
      />
    </div>
  );
}

function ImagePreview({ url, fileName, zoom }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`${IMAGE_VIEWPORT_CLASSES} flex min-h-60 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-500 dark:text-slate-400`}>
        <ImageOff className="h-8 w-8" aria-hidden="true" />
        This image could not be previewed, but it can still be processed.
      </div>
    );
  }

  return (
    <div className={`${IMAGE_VIEWPORT_CLASSES} overflow-auto p-3`}>
      {/* Width (not transform) scales the image, so the container's scrollbars follow the zoom. */}
      <img
        src={url}
        alt={`Uploaded invoice: ${fileName}`}
        style={{ width: `${zoom * 100}%` }}
        className="mx-auto h-auto max-w-none rounded-md bg-white shadow-sm transition-[width] duration-150"
        onError={() => {
          log.warn('Image preview failed to load', { fileName });
          setHasError(true);
        }}
      />
    </div>
  );
}

function PdfPreview({ url, fileName }) {
  return (
    <object data={url} type="application/pdf" aria-label={`Uploaded invoice: ${fileName}`} className={`${PDF_VIEWPORT_CLASSES} w-full`}>
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <FileText className="h-8 w-8" aria-hidden="true" />
        Your browser can&apos;t display this PDF inline.
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Open PDF in a new tab <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </object>
  );
}

/** Shows the uploaded file: zoomable image, or the browser's built-in PDF viewer. */
export default function InvoiceViewer({ file, previewUrl }) {
  const [zoom, setZoom] = useState(1);
  const isPdf = isPdfFile(file);

  return (
    <Card
      title={file.name}
      icon={isPdf ? FileText : FileImage}
      actions={isPdf ? <Badge>{formatFileSize(file.size)}</Badge> : <ZoomControls zoom={zoom} onZoomChange={setZoom} />}
      bodyClassName="p-3"
    >
      {isPdf ? (
        <PdfPreview url={previewUrl} fileName={file.name} />
      ) : (
        <ImagePreview url={previewUrl} fileName={file.name} zoom={zoom} />
      )}
    </Card>
  );
}
