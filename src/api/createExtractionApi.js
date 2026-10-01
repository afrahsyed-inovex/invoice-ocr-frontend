import { INVOICE_STATUS } from '../mappers/invoiceShape';
import { delay } from '../utils/delay';
import { createLogger } from '../utils/logger';
import { createSampleInvoiceFile } from '../utils/sampleInvoiceImage';
import { API_ERROR_KIND, ApiError } from './apiError';
import { MOCK_DELAY_MS, USE_MOCK, getExtractUrl } from './config';
import { postInvoiceFile } from './httpClient';

/*
 * In mock mode, file names can trigger failures so error states are easy to test:
 * a name containing "timeout" simulates a timeout, "error" simulates a server error.
 */
const MOCK_FAILURE_TRIGGERS = [
  { keyword: 'timeout', kind: API_ERROR_KIND.TIMEOUT, message: 'did not respond in time (simulated timeout).' },
  { keyword: 'error', kind: API_ERROR_KIND.SERVER, message: 'ran into an internal error (simulated HTTP 500).' },
];

function describeFile(file) {
  return { name: file.name, type: file.type || 'unknown', sizeBytes: file.size };
}

/**
 * Builds the API module for one backend. Both backends share this behaviour;
 * they only differ by config, mock data and mapper.
 */
export function createExtractionApi({ backend, mockResponses, normalize }) {
  const log = createLogger(`api:${backend.id}`);
  let nextMockIndex = 0;

  function normalizeResponse(raw) {
    try {
      const invoice = normalize(raw);
      log.debug('Mapped response to internal shape', invoice);
      return invoice;
    } catch (error) {
      log.error('Could not map backend response', { error, raw });
      throw new ApiError(
        API_ERROR_KIND.INVALID_RESPONSE,
        `${backend.label}'s backend returned data in an unexpected format.`,
        { cause: error },
      );
    }
  }

  async function extractWithBackend(file, signal) {
    log.info('Request sent', { url: getExtractUrl(backend), file: describeFile(file) });
    const raw = await postInvoiceFile(backend, file, { signal });
    log.info('Response received');
    log.debug('Raw response', raw);
    return normalizeResponse(raw);
  }

  async function extractWithMock(file, signal) {
    log.info('Mock mode: simulating extraction', describeFile(file));
    await delay(MOCK_DELAY_MS, signal);

    const fileName = file.name.toLowerCase();
    const failure = MOCK_FAILURE_TRIGGERS.find(({ keyword }) => fileName.includes(keyword));
    if (failure) throw new ApiError(failure.kind, `${backend.label}'s backend ${failure.message}`);

    const raw = mockResponses[nextMockIndex % mockResponses.length];
    nextMockIndex += 1;
    log.debug('Mock raw response', raw);
    return normalizeResponse(structuredClone(raw));
  }

  /** Sends the file to the backend (or the mocks) and resolves with a normalized invoice. */
  function extractInvoice(file, { signal } = {}) {
    return USE_MOCK ? extractWithMock(file, signal) : extractWithBackend(file, signal);
  }

  /**
   * Picks a random usable mock invoice and renders it as an image. Works in both modes,
   * so the UI can always be demoed without a backend.
   */
  function getSampleInvoice() {
    const usable = mockResponses
      .map((raw) => ({ raw, invoice: normalize(structuredClone(raw)) }))
      .filter(({ invoice }) => invoice.status !== INVOICE_STATUS.FAILED);
    const { raw, invoice } = usable[Math.floor(Math.random() * usable.length)];
    const file = createSampleInvoiceFile(invoice, `sample-${invoice.invoiceNumber ?? 'invoice'}.svg`);

    return {
      file,
      extract: async ({ signal } = {}) => {
        log.info('Sample invoice: simulating extraction', describeFile(file));
        await delay(MOCK_DELAY_MS, signal);
        return normalizeResponse(structuredClone(raw));
      },
    };
  }

  return { extractInvoice, getSampleInvoice };
}
