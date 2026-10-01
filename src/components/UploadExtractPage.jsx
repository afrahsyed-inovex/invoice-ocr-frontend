import { FilePlus2, FileX, RotateCw } from 'lucide-react';
import { useCallback } from 'react';
import { useFilePreview } from '../hooks/useFilePreview';
import { EXTRACTION_STATUS, useInvoiceExtraction } from '../hooks/useInvoiceExtraction';
import { REVIEW_STATUS } from '../mappers/invoiceShape';
import { getPreviewKind } from '../utils/fileValidation';
import { formatFileSize } from '../utils/format';
import EmptyState from './EmptyState';
import IdleView from './IdleView';
import InvoiceResult from './InvoiceResult';
import InvoiceViewer from './InvoiceViewer';
import PageHeader from './PageHeader';
import SkeletonLoader from './SkeletonLoader';
import SplitView from './SplitView';
import StatusBanner from './StatusBanner';
import Button from './ui/Button';

/**
 * Upload → preview → extracted data, shared by both backends. Pages only pass their
 * backend config and its `extract(file, { signal })` function.
 */
export default function UploadExtractPage({ title, description, backend, extract, uploadOptions }) {
  const { status, file, result, error, processFile, retry, reset } = useInvoiceExtraction(extract);
  const { previewUrl, showFile, clearPreview } = useFilePreview();

  const handleFile = useCallback(
    (selectedFile) => {
      showFile(selectedFile);
      processFile(selectedFile);
    },
    [processFile, showFile],
  );

  const handleProcessAnother = useCallback(() => {
    reset();
    clearPreview();
  }, [clearPreview, reset]);

  const processAnotherButton = (
    <Button size="sm" variant="primary" icon={FilePlus2} onClick={handleProcessAnother}>
      Process another invoice
    </Button>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader title={title} description={description} />

      {status === EXTRACTION_STATUS.IDLE ? (
        <IdleView backendLabel={backend.label} onFileAccepted={handleFile} options={uploadOptions} />
      ) : (
        <SplitView
          viewer={
            // Keyed by URL so zoom and error state reset for each new file.
            <InvoiceViewer
              key={previewUrl}
              name={file.name}
              url={previewUrl}
              kind={getPreviewKind(file)}
              sizeLabel={formatFileSize(file.size)}
            />
          }
        >
          {status === EXTRACTION_STATUS.LOADING && <SkeletonLoader label={`Extracting data with ${backend.label}'s backend…`} />}

          {status === EXTRACTION_STATUS.ERROR && (
            <StatusBanner variant="error" title="Extraction failed" message={error}>
              <Button size="sm" variant="primary" icon={RotateCw} onClick={retry}>
                Retry
              </Button>
              <Button size="sm" icon={FilePlus2} onClick={handleProcessAnother}>
                Process another invoice
              </Button>
            </StatusBanner>
          )}

          {status === EXTRACTION_STATUS.SUCCESS &&
            (result.invoice.status === REVIEW_STATUS.FAILED ? (
              // The backend processed the file but reported a failure, with its own reason.
              <EmptyState icon={FileX} title={`status: ${result.invoice.statusLabel}`} message={result.invoice.error}>
                {processAnotherButton}
              </EmptyState>
            ) : (
              <InvoiceResult
                invoice={result.invoice}
                raw={result.raw}
                fileName={file.name}
                backendLabel={backend.label}
                actions={processAnotherButton}
              />
            ))}
        </SplitView>
      )}
    </div>
  );
}
