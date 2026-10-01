import { ExternalLink, FileImage, FileText, ImageOff, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
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
        This image could not be displayed by the browser (TIFF files, for example, are not supported).
      </div>
    );
  }

  return (
    <div className={`${IMAGE_VIEWPORT_CLASSES} overflow-auto p-3`}>
      {/* Width (not transform) scales the image, so the container's scrollbars follow the zoom. */}
      <img
        src={url}
        alt={`Invoice: ${fileName}`}
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

function NoPreview() {
  return (
    <div className={`${VIEWPORT_CLASSES} flex min-h-60 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-500 dark:text-slate-400`}>
      <FileText className="h-8 w-8" aria-hidden="true" />
      Word documents can&apos;t be previewed in the browser. The extracted data is shown alongside.
    </div>
  );
}

/**
 * Shows an invoice: a zoomable image, the browser's built-in PDF viewer, or a placeholder.
 * `url` can be a local object URL (uploads) or a backend URL (Munhim's /images).
 *
 * @param {{ name: string, url: string, kind: 'image' | 'pdf' | 'none', sizeLabel?: string }} props
 */
export default function InvoiceViewer({ name, url, kind, sizeLabel }) {
  const [zoom, setZoom] = useState(1);
  const isImage = kind === 'image';

  return (
    <Card
      title={name}
      icon={isImage ? FileImage : FileText}
      actions={isImage ? <ZoomControls zoom={zoom} onZoomChange={setZoom} /> : sizeLabel && <Badge>{sizeLabel}</Badge>}
      bodyClassName="p-3"
    >
      {kind === 'pdf' && <PdfPreview url={url} fileName={name} />}
      {kind === 'image' && <ImagePreview url={url} fileName={name} zoom={zoom} />}
      {kind === 'none' && <NoPreview />}
    </Card>
  );
}
