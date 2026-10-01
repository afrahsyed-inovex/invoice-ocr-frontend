import axios from 'axios';
import { API_ERROR_KIND, ApiError, toApiError } from './apiError';
import { FILE_FIELD_NAME, REQUEST_TIMEOUT_MS, getExtractUrl } from './config';

const httpClient = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

/** POSTs the file as multipart/form-data and returns the parsed JSON body. */
export async function postInvoiceFile(backend, file, { signal } = {}) {
  const formData = new FormData();
  formData.append(FILE_FIELD_NAME, file, file.name);

  let response;
  try {
    // No Content-Type header: the browser adds multipart/form-data with the correct boundary.
    response = await httpClient.post(getExtractUrl(backend), formData, { signal });
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
