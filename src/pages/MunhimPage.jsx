import { MUNHIM_API } from '../api/config';
import { extractInvoice } from '../api/munhimApi';
import UploadExtractPage from '../components/UploadExtractPage';

export default function MunhimPage() {
  return (
    <UploadExtractPage
      title="Munhim's extractor"
      description="Upload an invoice. Munhim's pipeline runs Tesseract OCR on his fixed invoice template, reading every number twice and cross-checking it."
      backend={MUNHIM_API}
      extract={extractInvoice}
    />
  );
}
