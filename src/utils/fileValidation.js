import { formatFileSize } from './format';

export const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** MIME type -> extensions, in the format react-dropzone's `accept` option expects. */
export const ACCEPTED_FILE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

export const ACCEPTED_FORMATS_LABEL = 'PNG, JPG, JPEG, WEBP or PDF';

const ACCEPTED_EXTENSIONS = Object.values(ACCEPTED_FILE_TYPES).flat();

export function getFileExtension(fileName = '') {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? '' : fileName.slice(dotIndex).toLowerCase();
}

export function isPdfFile(file) {
  return file?.type === 'application/pdf' || getFileExtension(file?.name) === '.pdf';
}

/** Returns a user-facing error message, or null when the file is acceptable. */
export function validateFile(file) {
  if (!file) return 'No file was selected.';

  // Some systems report an empty MIME type, so the extension is checked as a fallback.
  const hasAcceptedType = file.type in ACCEPTED_FILE_TYPES;
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.includes(getFileExtension(file.name));
  if (!hasAcceptedType && !hasAcceptedExtension) {
    return `"${file.name}" is not a supported file type. Please upload a ${ACCEPTED_FORMATS_LABEL} file.`;
  }

  if (file.size === 0) return `"${file.name}" is empty. Please choose another file.`;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is ${formatFileSize(file.size)}. The maximum size is ${MAX_FILE_SIZE_MB} MB.`;
  }

  return null;
}

/** Converts react-dropzone rejections into a single user-facing message. */
export function getDropRejectionMessage(rejections) {
  const isTooMany =
    rejections.length > 1 ||
    rejections.some(({ errors }) => errors.some((error) => error.code === 'too-many-files'));
  if (isTooMany) return 'Please upload one invoice at a time.';

  const [rejection] = rejections;
  return (
    validateFile(rejection.file) ??
    rejection.errors[0]?.message ??
    'This file could not be accepted. Please try another one.'
  );
}
