import { Check, Copy, Download, FilePlus2, X } from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { buildExportFileName, downloadJson, toPrettyJson } from '../utils/json';
import { createLogger } from '../utils/logger';
import Button from './ui/Button';

const log = createLogger('export');

const COPY_FEEDBACK = {
  idle: { icon: Copy, label: 'Copy JSON' },
  copied: { icon: Check, label: 'Copied!' },
  failed: { icon: X, label: 'Copy failed' },
};

export default function ResultActions({ invoice, fileName, onProcessAnother }) {
  const { copyState, copy } = useCopyToClipboard();
  const copyFeedback = COPY_FEEDBACK[copyState];

  const handleDownload = () => {
    const exportName = buildExportFileName(fileName);
    downloadJson(invoice, exportName);
    log.info('Downloaded JSON', { fileName: exportName });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" icon={copyFeedback.icon} onClick={() => copy(toPrettyJson(invoice))} aria-live="polite">
        {copyFeedback.label}
      </Button>
      <Button size="sm" icon={Download} onClick={handleDownload}>
        Download JSON
      </Button>
      <Button size="sm" variant="primary" icon={FilePlus2} onClick={onProcessAnother} className="sm:ml-auto">
        Process another invoice
      </Button>
    </div>
  );
}
