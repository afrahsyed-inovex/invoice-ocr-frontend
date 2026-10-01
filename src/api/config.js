/**
 * Everything that depends on the backends' contracts lives here.
 * When the real APIs are ready, this file and the mappers are usually all that changes.
 */
const env = import.meta.env;

/** Mock mode is on unless VITE_USE_MOCK is explicitly "false". */
export const USE_MOCK = String(env.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false';

export const REQUEST_TIMEOUT_MS = Number(env.VITE_REQUEST_TIMEOUT_MS) || 60_000;

/** Path appended to each backend's base URL. */
export const EXTRACT_ENDPOINT = '/extract';

/** multipart/form-data field the backends read the uploaded file from. */
export const FILE_FIELD_NAME = 'file';

/** Fake latency for mock responses, so loading states are visible. */
export const MOCK_DELAY_MS = 1500;

const stripTrailingSlash = (url) => url.replace(/\/+$/, '');

export const BACKENDS = {
  munhim: {
    id: 'munhim',
    label: 'Munhim',
    baseUrl: stripTrailingSlash(env.VITE_MUNHIM_API_URL || 'http://localhost:8000'),
  },
  usman: {
    id: 'usman',
    label: 'Usman',
    baseUrl: stripTrailingSlash(env.VITE_USMAN_API_URL || 'http://localhost:8001'),
  },
};

export function getExtractUrl(backend) {
  return `${backend.baseUrl}${EXTRACT_ENDPOINT}`;
}
