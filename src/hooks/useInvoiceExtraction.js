import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/apiError';
import { createLogger } from '../utils/logger';

const log = createLogger('extraction');

export const EXTRACTION_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const INITIAL_STATE = { status: EXTRACTION_STATUS.IDLE, file: null, invoice: null, error: null };

function toUserMessage(error) {
  return error instanceof ApiError
    ? error.message
    : 'Something went wrong while processing the invoice. Please try again.';
}

/**
 * Runs an extraction and tracks its lifecycle. Starting a new run (or resetting/unmounting)
 * aborts the previous one, so a slow response can never overwrite newer state.
 *
 * @param {(file: File, options: { signal: AbortSignal }) => Promise<object>} extract
 */
export function useInvoiceExtraction(extract) {
  const [state, setState] = useState(INITIAL_STATE);
  const controllerRef = useRef(null);
  const lastJobRef = useRef(null);

  const abortPending = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const runJob = useCallback(
    async (job) => {
      abortPending();
      const controller = new AbortController();
      controllerRef.current = controller;
      lastJobRef.current = job;

      setState({ status: EXTRACTION_STATUS.LOADING, file: job.file, invoice: null, error: null });
      log.info('Upload started', { name: job.file.name, sizeBytes: job.file.size });

      try {
        const invoice = await job.run({ signal: controller.signal });
        if (controller.signal.aborted) return;

        log.info('Extraction finished', { status: invoice.status, lineItems: invoice.lineItems.length });
        setState({ status: EXTRACTION_STATUS.SUCCESS, file: job.file, invoice, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;

        log.error('Extraction failed', error);
        setState({ status: EXTRACTION_STATUS.ERROR, file: job.file, invoice: null, error: toUserMessage(error) });
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [abortPending],
  );

  const processFile = useCallback(
    (file) => runJob({ file, run: (options) => extract(file, options) }),
    [extract, runJob],
  );

  /** Runs a sample from getSampleInvoice(): `{ file, extract(options) }`. */
  const processSample = useCallback(
    (sample) => runJob({ file: sample.file, run: sample.extract }),
    [runJob],
  );

  const retry = useCallback(() => {
    if (lastJobRef.current) runJob(lastJobRef.current);
  }, [runJob]);

  const reset = useCallback(() => {
    abortPending();
    lastJobRef.current = null;
    setState(INITIAL_STATE);
  }, [abortPending]);

  useEffect(() => abortPending, [abortPending]);

  return { ...state, processFile, processSample, retry, reset };
}
