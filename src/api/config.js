/**
 * Everything that depends on the two backends' APIs lives here.
 *
 * Settings come from two places, first match wins:
 * 1. window.__APP_CONFIG__ — written by the Docker container at startup (public/config.js),
 *    so the same image can be pointed at different backends without a rebuild.
 * 2. import.meta.env — the .env file, baked in by Vite at dev/build time.
 */
const runtimeConfig = window.__APP_CONFIG__ ?? {};
const readSetting = (key) => runtimeConfig[key] || import.meta.env[key];

const stripTrailingSlash = (url) => url.replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = Number(readSetting('VITE_REQUEST_TIMEOUT_MS')) || 120_000;

/**
 * Munhim's pipeline (munhims-backend/poc-munhim), served for uploads by the adapter in
 * scripts/munhim-upload-api: it runs his pipeline on one file and returns his InvoiceRecord.
 */
export const MUNHIM_API = {
  id: 'munhim',
  label: 'Munhim',
  baseUrl: stripTrailingSlash(readSetting('VITE_MUNHIM_API_URL') || 'http://localhost:8000'),
  paths: {
    extract: '/extract',
  },
  /** multipart/form-data field the adapter reads the upload from. */
  fileFieldName: 'file',
};

/**
 * Usman's backend (usmans-backend/invoice--usman, app/api/extract.py).
 * Stateless: each upload is processed and returned in the response.
 */
export const USMAN_API = {
  id: 'usman',
  label: 'Usman',
  baseUrl: stripTrailingSlash(readSetting('VITE_USMAN_API_URL') || 'http://localhost:8001'),
  paths: {
    extract: '/v1/extract',
  },
  /** multipart/form-data field the backend reads the upload from. */
  fileFieldName: 'file',
  /** Sent as X-API-Key; must match one of API_KEYS in the backend's .env (empty when auth is off). */
  apiKey: readSetting('VITE_USMAN_API_KEY') || '',
  /** Optional ?llm= override: "auto" | "always" | "off". Empty uses the backend's LLM_MODE. */
  llmMode: readSetting('VITE_USMAN_LLM_MODE') || '',
};

export function buildUrl(backend, path) {
  return `${backend.baseUrl}${path}`;
}
