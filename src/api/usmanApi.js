import { normalizeUsmanInvoice } from '../mappers/usmanMapper';
import { createLogger } from '../utils/logger';
import { API_ERROR_KIND, ApiError } from './apiError';
import { USMAN_API } from './config';
import { requestJson } from './httpClient';

const log = createLogger('api:usman');

/** POST /v1/extract — uploads one file and resolves with the normalized invoice and raw JSON. */
export async function extractInvoice(file, { signal } = {}) {
  const formData = new FormData();
  formData.append(USMAN_API.fileFieldName, file, file.name);

  log.info('Request sent', {
    path: USMAN_API.paths.extract,
    file: { name: file.name, type: file.type || 'unknown', sizeBytes: file.size },
    llm: USMAN_API.llmMode || 'backend default',
  });

  const raw = await requestJson(USMAN_API, {
    method: 'POST',
    path: USMAN_API.paths.extract,
    data: formData,
    params: USMAN_API.llmMode ? { llm: USMAN_API.llmMode } : undefined,
    headers: USMAN_API.apiKey ? { 'X-API-Key': USMAN_API.apiKey } : undefined,
    signal,
  });
  log.info('Response received', { status: raw.meta?.status, items: raw.items?.length });
  log.debug('Raw response', raw);

  try {
    return { invoice: normalizeUsmanInvoice(raw), raw };
  } catch (error) {
    log.error('Could not map backend response', { error, raw });
    throw new ApiError(API_ERROR_KIND.INVALID_RESPONSE, "Usman's backend returned data in an unexpected format.", {
      cause: error,
    });
  }
}
