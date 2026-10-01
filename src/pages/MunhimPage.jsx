import { extractInvoice, getSampleInvoice, munhimBackend } from '../api/munhimApi';
import InvoiceWorkspace from '../components/InvoiceWorkspace';

export default function MunhimPage() {
  return (
    <InvoiceWorkspace
      title="Munhim's extractor"
      description="Upload an invoice image or PDF to extract vendor, customer, line items and totals using Munhim's backend."
      backend={munhimBackend}
      extract={extractInvoice}
      getSample={getSampleInvoice}
    />
  );
}
