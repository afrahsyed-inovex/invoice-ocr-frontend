import { normalizeUsmanInvoice } from '../mappers/usmanMapper';
import { usmanMockResponses } from '../mock/usmanMockResponses';
import { BACKENDS } from './config';
import { createExtractionApi } from './createExtractionApi';

export const usmanBackend = BACKENDS.usman;

export const { extractInvoice, getSampleInvoice } = createExtractionApi({
  backend: usmanBackend,
  mockResponses: usmanMockResponses,
  normalize: normalizeUsmanInvoice,
});
