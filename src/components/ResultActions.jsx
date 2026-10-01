import { Check, Copy, Download, X } from 'lucide-react';
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

/** Copy / download the backend's raw JSON response, plus any page-specific actions. */
export default function ResultActions({ raw, fileName, children }) {
  const { copyState, copy } = useCopyToClipboard();
  const copyFeedback = COPY_FEEDBACK[copyState];

  const handleDownload = () => {
    const exportName = buildExportFileName(fileName);
    downloadJson(raw, exportName);
    log.info('Downloaded JSON', { fileName: exportName });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" icon={copyFeedback.icon} onClick={() => copy(toPrettyJson(raw))} aria-live="polite">
        {copyFeedback.label}
      </Button>
      <Button size="sm" icon={Download} onClick={handleDownload}>
        Download JSON
      </Button>
      {children}
    </div>
  );
}
