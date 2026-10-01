import { normalizeMunhimInvoice } from '../mappers/munhimMapper';
import { munhimMockResponses } from '../mock/munhimMockResponses';
import { BACKENDS } from './config';
import { createExtractionApi } from './createExtractionApi';

export const munhimBackend = BACKENDS.munhim;

export const { extractInvoice, getSampleInvoice } = createExtractionApi({
  backend: munhimBackend,
  mockResponses: munhimMockResponses,
  normalize: normalizeMunhimInvoice,
});
