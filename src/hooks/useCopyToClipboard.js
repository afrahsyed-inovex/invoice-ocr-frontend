import { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger } from '../utils/logger';

const log = createLogger('clipboard');
const FEEDBACK_DURATION_MS = 2000;

/** Copies text and exposes a short-lived 'copied' | 'failed' state for button feedback. */
export function useCopyToClipboard() {
  const [copyState, setCopyState] = useState('idle');
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      log.info('Copied to clipboard', { characters: text.length });
    } catch (error) {
      setCopyState('failed');
      log.warn('Clipboard write failed', error);
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyState('idle'), FEEDBACK_DURATION_MS);
  }, []);

  return { copyState, copy };
}
