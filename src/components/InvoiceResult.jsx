import { Braces, LayoutList } from 'lucide-react';
import { useId, useState } from 'react';
import { REVIEW_STATUS } from '../mappers/invoiceShape';
import ExtractedDataPanel from './ExtractedDataPanel';
import InvoiceSummary from './InvoiceSummary';
import JsonViewer from './JsonViewer';
import ResultActions from './ResultActions';
import StatusBanner from './StatusBanner';
import Tabs from './ui/Tabs';

const RESULT_TABS = [
  { id: 'data', label: 'Extracted data', icon: LayoutList },
  { id: 'json', label: 'Raw JSON', icon: Braces },
];

const STATUS_VARIANT = {
  [REVIEW_STATUS.OK]: 'success',
  [REVIEW_STATUS.NEEDS_REVIEW]: 'partial',
  [REVIEW_STATUS.FAILED]: 'error',
};

/** Shows the status value exactly as the backend returned it. */
function ResultStatusBanner({ invoice, backendLabel }) {
  return (
    <StatusBanner
      variant={STATUS_VARIANT[invoice.status] ?? 'info'}
      title={`status: ${invoice.statusLabel ?? 'null'}`}
      message={`As returned by ${backendLabel}'s backend.`}
    />
  );
}

/**
 * Shared result view for both pages: status, summary, then the extracted data or the
 * backend's raw JSON. `actions` adds page-specific buttons (e.g. "Process another invoice").
 */
export default function InvoiceResult({ invoice, raw, fileName, backendLabel, actions }) {
  const [activeTab, setActiveTab] = useState('data');
  const idPrefix = useId();

  return (
    <div className="space-y-4">
      <ResultStatusBanner invoice={invoice} backendLabel={backendLabel} />
      <InvoiceSummary invoice={invoice} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={RESULT_TABS} activeId={activeTab} onChange={setActiveTab} idPrefix={idPrefix} label="Result view" />
        <ResultActions raw={raw} fileName={fileName}>
          {actions}
        </ResultActions>
      </div>

      <div role="tabpanel" id={`${idPrefix}-panel-${activeTab}`} aria-labelledby={`${idPrefix}-tab-${activeTab}`}>
        {activeTab === 'data' ? (
          <ExtractedDataPanel invoice={invoice} />
        ) : (
          <JsonViewer value={raw} label={`Raw JSON response from ${backendLabel}'s backend`} />
        )}
      </div>
    </div>
  );
}
