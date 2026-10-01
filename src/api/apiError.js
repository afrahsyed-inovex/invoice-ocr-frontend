import axios from 'axios';
import { REQUEST_TIMEOUT_MS } from './config';

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

/**
 * Both backends are FastAPI apps, so errors arrive as {"detail": "..."}, or as
 * {"detail": [{msg, ...}]} for request validation errors.
 */
function extractErrorDetail(data) {
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item?.msg).filter(Boolean).join('; ') || null;
  }
  return null;
}

/** The backend's own error, unchanged: status code plus its "detail" text. */
function describeHttpError(status, detail, backend) {
  return `${backend.label}'s backend returned HTTP ${status}${detail ? `: ${detail}` : ''}`;
}

/** The message to show for any error thrown by the API layer. */
export function getUserMessage(error) {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
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
