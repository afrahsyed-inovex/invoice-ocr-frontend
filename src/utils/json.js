export function toPrettyJson(value) {
  return JSON.stringify(value, null, 2);
}

/** "scan 01.pdf" -> "scan-01-extracted.json" */
export function buildExportFileName(sourceFileName = 'invoice') {
  const baseName = sourceFileName.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-') || 'invoice';
  return `${baseName}-extracted.json`;
}

export function downloadJson(value, fileName) {
  const blob = new Blob([toPrettyJson(value)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoke on the next tick so the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
