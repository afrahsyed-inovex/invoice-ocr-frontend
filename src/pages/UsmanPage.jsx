import { useCallback, useState } from 'react';
import { USMAN_API } from '../api/config';
import { LLM_MODES, extractInvoice } from '../api/usmanApi';
import LlmModeSelect from '../components/LlmModeSelect';
import UploadExtractPage from '../components/UploadExtractPage';

export default function UsmanPage() {
  const [llmMode, setLlmMode] = useState(USMAN_API.llmMode);

  // Recreated when the mode changes, so the next upload (and Retry) sends the chosen ?llm=.
  const extract = useCallback((file, options) => extractInvoice(file, { ...options, llmMode }), [llmMode]);

  return (
    <UploadExtractPage
      title="Usman's extractor"
      description="Upload an invoice. Usman's backend runs Tesseract OCR with a layout parser and arithmetic checks, with an optional Gemini fallback."
      backend={USMAN_API}
      extract={extract}
      uploadOptions={<LlmModeSelect modes={LLM_MODES} value={llmMode} onChange={setLlmMode} />}
    />
  );
}
