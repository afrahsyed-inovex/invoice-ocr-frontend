import { normalizeMunhimInvoice } from '../mappers/munhimMapper';
import { createLogger } from '../utils/logger';
import { API_ERROR_KIND, ApiError } from './apiError';
import { MUNHIM_API } from './config';
import { requestJson } from './httpClient';

const log = createLogger('api:munhim');

/**
 * POST /extract on the upload adapter (scripts/munhim-upload-api), which runs Munhim's
 * pipeline on the file and returns his InvoiceRecord unchanged.
 */
export async function extractInvoice(file, { signal } = {}) {
  const formData = new FormData();
  formData.append(MUNHIM_API.fileFieldName, file, file.name);

  log.info('Request sent', {
    path: MUNHIM_API.paths.extract,
    file: { name: file.name, type: file.type || 'unknown', sizeBytes: file.size },
  });

  const raw = await requestJson(MUNHIM_API, {
    method: 'POST',
    path: MUNHIM_API.paths.extract,
    data: formData,
    signal,
  });
  log.info('Response received', { status: raw.status, items: raw.items?.length });
  log.debug('Raw response', raw);

  try {
    return { invoice: normalizeMunhimInvoice(raw), raw };
  } catch (error) {
    log.error('Could not map backend response', { error, raw });
    throw new ApiError(API_ERROR_KIND.INVALID_RESPONSE, "Munhim's backend returned data in an unexpected format.", {
      cause: error,
    });
  }
}
