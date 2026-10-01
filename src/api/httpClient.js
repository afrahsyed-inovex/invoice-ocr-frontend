import axios from 'axios';
import { API_ERROR_KIND, ApiError, toApiError } from './apiError';
import { REQUEST_TIMEOUT_MS, buildUrl } from './config';

const httpClient = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

/**
 * Sends one request to a backend and returns the parsed JSON body.
 * Every failure is converted to an ApiError with a user-facing message.
 */
export async function requestJson(backend, { method = 'GET', path, data, params, headers, signal }) {
  let response;
  try {
    // For FormData bodies no Content-Type is set: the browser adds the multipart boundary.
    response = await httpClient.request({ method, url: buildUrl(backend, path), data, params, headers, signal });
  } catch (error) {
    throw toApiError(error, backend);
  }

  // Axios leaves the body as a string when it isn't valid JSON.
  if (response.data === null || typeof response.data !== 'object') {
    throw new ApiError(
      API_ERROR_KIND.INVALID_RESPONSE,
      `${backend.label}'s backend returned a response that is not valid JSON.`,
      { status: response.status },
    );
  }

  return response.data;
}
