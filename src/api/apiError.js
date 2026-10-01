import axios from 'axios';
import { EXTRACT_ENDPOINT, REQUEST_TIMEOUT_MS, getExtractUrl } from './config';

export const API_ERROR_KIND = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  CLIENT: 'client',
  SERVER: 'server',
  INVALID_RESPONSE: 'invalid_response',
  UNKNOWN: 'unknown',
};

/** An error whose `message` is safe to show to the user. */
export class ApiError extends Error {
  constructor(kind, message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** Pulls a readable reason out of common error bodies (FastAPI, Flask, Express). */
function extractErrorDetail(data) {
  if (typeof data === 'string') return data.length <= 200 ? data.trim() : null;
  if (!data || typeof data !== 'object') return null;

  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item?.msg).filter(Boolean).join('; ') || null;
  }
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  return null;
}

function describeHttpError(status, detail, backend) {
  const reason = detail ? `: ${detail}` : '.';

  if (status === 404) {
    return `The extraction endpoint was not found (${getExtractUrl(backend)}). Check that ${backend.label}'s backend exposes ${EXTRACT_ENDPOINT}.`;
  }
  if (status === 413) return 'The file is too large for the backend to accept.';
  if (status === 400 || status === 415 || status === 422) {
    return `${backend.label}'s backend could not process this file${reason}`;
  }
  if (status >= 500) {
    return `${backend.label}'s backend ran into an internal error (HTTP ${status}). Please try again in a moment.`;
  }
  return `The request was rejected (HTTP ${status})${reason}`;
}

/** Converts any axios/network failure into an ApiError with a friendly message. */
export function toApiError(error, backend) {
  if (error instanceof ApiError) return error;

  if (!axios.isAxiosError(error)) {
    return new ApiError(API_ERROR_KIND.UNKNOWN, 'Something went wrong while processing the invoice.', {
      cause: error,
    });
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError(
      API_ERROR_KIND.TIMEOUT,
      `${backend.label}'s backend did not respond within ${Math.round(REQUEST_TIMEOUT_MS / 1000)} seconds. Try again or use a smaller file.`,
      { cause: error },
    );
  }

  if (!error.response) {
    return new ApiError(
      API_ERROR_KIND.NETWORK,
      `Could not reach ${backend.label}'s backend at ${backend.baseUrl}. Make sure it is running and allows requests from this site (CORS).`,
      { cause: error },
    );
  }

  const { status, data } = error.response;
  return new ApiError(
    status >= 500 ? API_ERROR_KIND.SERVER : API_ERROR_KIND.CLIENT,
    describeHttpError(status, extractErrorDetail(data), backend),
    { status, cause: error },
  );
}
