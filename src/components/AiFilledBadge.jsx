import { Sparkles } from 'lucide-react';
import Badge from './ui/Badge';

/** Marks values that Usman's backend took from its Gemini fallback (meta.llm_fields). */
export default function AiFilledBadge() {
  return (
    <Badge tone="brand" title="Filled in by the AI fallback (Gemini), not read by OCR">
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      AI
    </Badge>
  );
}
