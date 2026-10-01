import { USMAN_API } from '../api/config';
import { extractInvoice } from '../api/usmanApi';
import UploadExtractPage from '../components/UploadExtractPage';

export default function UsmanPage() {
  return (
    <UploadExtractPage
      title="Usman's extractor"
      description="Upload an invoice. Usman's backend runs Tesseract OCR with a layout parser and arithmetic checks, with an optional Gemini fallback."
      backend={USMAN_API}
      extract={extractInvoice}
    />
  );
}
