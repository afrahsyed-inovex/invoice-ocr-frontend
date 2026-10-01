import { FilePlus2, FileSearch, RotateCw, Server, Sparkles } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { USE_MOCK, getExtractUrl } from '../api/config';
import { useFilePreview } from '../hooks/useFilePreview';
import { EXTRACTION_STATUS, useInvoiceExtraction } from '../hooks/useInvoiceExtraction';
import { INVOICE_STATUS, getMissingKeyFields } from '../mappers/invoiceShape';
import EmptyState from './EmptyState';
import ExtractedDataPanel from './ExtractedDataPanel';
import InvoiceViewer from './InvoiceViewer';
import ResultActions from './ResultActions';
import SkeletonLoader from './SkeletonLoader';
import StatusBanner from './StatusBanner';
import UploadZone from './UploadZone';
import Badge from './ui/Badge';
import Button from './ui/Button';

function WorkspaceHeader({ title, description, backend }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <Badge tone={USE_MOCK ? 'warning' : 'brand'} className="self-start py-1 sm:self-auto">
        <Server className="h-3.5 w-3.5" aria-hidden="true" />
        {USE_MOCK ? `Mock data · ${backend.label}` : `POST ${getExtractUrl(backend)}`}
      </Badge>
    </div>
  );
}

function ExtractionResult({ extraction, backendLabel, onProcessAnother }) {
  const { status, invoice, error, file, retry } = extraction;

  if (status === EXTRACTION_STATUS.LOADING) {
    return <SkeletonLoader label={`Extracting data with ${backendLabel}'s model…`} />;
  }

  const actions = (
    <>
      <Button size="sm" variant="primary" icon={RotateCw} onClick={retry}>
        Retry
      </Button>
      <Button size="sm" icon={FilePlus2} onClick={onProcessAnother}>
        Process another invoice
      </Button>
    </>
  );

  if (status === EXTRACTION_STATUS.ERROR) {
    return (
      <StatusBanner variant="error" title="Extraction failed" message={error}>
        {actions}
      </StatusBanner>
    );
  }

  if (invoice.status === INVOICE_STATUS.FAILED) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No invoice data found"
        message="The model could not find any invoice fields in this file. Try a clearer scan, a higher-resolution image, or a different file."
      >
        {actions}
      </EmptyState>
    );
  }

  const missingFields = getMissingKeyFields(invoice);

  return (
    <div className="space-y-4">
      {invoice.status === INVOICE_STATUS.PARTIAL ? (
        <StatusBanner
          variant="partial"
          title="Partially extracted"
          message={
            missingFields.length > 0
              ? `Some fields could not be found: ${missingFields.join(', ')}. Please review before using the data.`
              : 'The backend flagged this result as incomplete. Please review before using the data.'
          }
        />
      ) : (
        <StatusBanner variant="success" title="Extraction complete" message="All key fields were found. Review the values below." />
      )}
      <ResultActions invoice={invoice} fileName={file.name} onProcessAnother={onProcessAnother} />
      <ExtractedDataPanel invoice={invoice} />
    </div>
  );
}

/**
 * The full upload → preview → extracted data flow. Pages only differ by the
 * functions they pass in, so both backends share exactly the same UI.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {{ label: string, baseUrl: string }} props.backend
 * @param {(file: File, options: { signal: AbortSignal }) => Promise<object>} props.extract
 * @param {() => { file: File, extract: Function }} props.getSample
 */
export default function InvoiceWorkspace({ title, description, backend, extract, getSample }) {
  const extraction = useInvoiceExtraction(extract);
  const { previewUrl, showFile, clearPreview } = useFilePreview();
  const { processFile, processSample, reset } = extraction;

  useEffect(() => {
    document.title = `${title} · Invoice OCR Studio`;
  }, [title]);

  const handleFile = useCallback(
    (file) => {
      showFile(file);
      processFile(file);
    },
    [processFile, showFile],
  );

  const handleSample = useCallback(() => {
    const sample = getSample();
    showFile(sample.file);
    processSample(sample);
  }, [getSample, processSample, showFile]);

  const handleProcessAnother = useCallback(() => {
    reset();
    clearPreview();
  }, [clearPreview, reset]);

  const isIdle = extraction.status === EXTRACTION_STATUS.IDLE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <WorkspaceHeader title={title} description={description} backend={backend} />

      {isIdle ? (
        <div className="animate-fade-in mx-auto max-w-3xl">
          <UploadZone onFileAccepted={handleFile} />
          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-500 sm:flex-row sm:justify-center dark:text-slate-400">
            <span>No invoice at hand?</span>
            <Button variant="ghost" size="sm" icon={Sparkles} onClick={handleSample} className="text-brand-600 dark:text-brand-400">
              Try a sample invoice
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-24">
            {/* Keyed by URL so zoom and error state reset for each new file. */}
            <InvoiceViewer key={previewUrl} file={extraction.file} previewUrl={previewUrl} />
          </div>
          <div className="min-w-0">
            <ExtractionResult extraction={extraction} backendLabel={backend.label} onProcessAnother={handleProcessAnother} />
          </div>
        </div>
      )}
    </div>
  );
}
