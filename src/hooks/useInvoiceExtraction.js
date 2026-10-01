import { useCallback, useEffect, useRef, useState } from 'react';
import { getUserMessage } from '../api/apiError';
import { createLogger } from '../utils/logger';

const log = createLogger('extraction');

export const EXTRACTION_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const INITIAL_STATE = { status: EXTRACTION_STATUS.IDLE, file: null, result: null, error: null };

/**
 * Runs an upload-and-extract request and tracks its lifecycle. Starting a new run (or
 * resetting/unmounting) aborts the previous one, so a slow response can never overwrite newer state.
 *
 * @param {(file: File, options: { signal: AbortSignal }) => Promise<{ invoice: object, raw: object }>} extract
 */
export function useInvoiceExtraction(extract) {
  const [state, setState] = useState(INITIAL_STATE);
  const controllerRef = useRef(null);
  const lastFileRef = useRef(null);

  const abortPending = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const processFile = useCallback(
    async (file) => {
      abortPending();
      const controller = new AbortController();
      controllerRef.current = controller;
      lastFileRef.current = file;

      setState({ status: EXTRACTION_STATUS.LOADING, file, result: null, error: null });
      log.info('Upload started', { name: file.name, sizeBytes: file.size });

      try {
        const result = await extract(file, { signal: controller.signal });
        if (controller.signal.aborted) return;

        log.info('Extraction finished', { status: result.invoice.status, lineItems: result.invoice.lineItems.length });
        setState({ status: EXTRACTION_STATUS.SUCCESS, file, result, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;

        log.error('Extraction failed', error);
        setState({ status: EXTRACTION_STATUS.ERROR, file, result: null, error: getUserMessage(error) });
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [abortPending, extract],
  );

  const retry = useCallback(() => {
    if (lastFileRef.current) processFile(lastFileRef.current);
  }, [processFile]);

  const reset = useCallback(() => {
    abortPending();
    lastFileRef.current = null;
    setState(INITIAL_STATE);
  }, [abortPending]);

  useEffect(() => abortPending, [abortPending]);

  return { ...state, processFile, retry, reset };
}
