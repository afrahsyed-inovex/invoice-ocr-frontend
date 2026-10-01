/*
 * File type and size are NOT checked here: Usman's backend validates every upload itself
 * (size cap, real type from the file's bytes) and its error message is shown as returned.
 */

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function getFileExtension(fileName = '') {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? '' : fileName.slice(dotIndex).toLowerCase();
}

/** How a file can be shown in the browser: 'image', 'pdf', or 'none' (Word files can't be previewed). */
export function getPreviewKind(file) {
  const extension = getFileExtension(file?.name);
  if (file?.type === 'application/pdf' || extension === '.pdf') return 'pdf';
  if (file?.type === DOCX_MIME_TYPE || extension === '.docx') return 'none';
  return 'image';
}
