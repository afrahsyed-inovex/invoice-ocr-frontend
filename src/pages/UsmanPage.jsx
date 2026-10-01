import { extractInvoice, getSampleInvoice, usmanBackend } from '../api/usmanApi';
import InvoiceWorkspace from '../components/InvoiceWorkspace';

export default function UsmanPage() {
  return (
    <InvoiceWorkspace
      title="Usman's extractor"
      description="Upload an invoice image or PDF to extract vendor, customer, line items and totals using Usman's backend."
      backend={usmanBackend}
      extract={extractInvoice}
      getSample={getSampleInvoice}
    />
  );
}
