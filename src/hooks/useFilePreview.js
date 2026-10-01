import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Holds an object URL for previewing a local file. URLs are created in event handlers
 * (not during render) and revoked when replaced or on unmount, so nothing leaks.
 */
export function useFilePreview() {
  const [preview, setPreview] = useState(null);
  const previewRef = useRef(null);

  const showFile = useCallback((file) => {
    const current = previewRef.current;
    if (current?.file === file) return;
    if (current) URL.revokeObjectURL(current.url);

    const next = file ? { file, url: URL.createObjectURL(file) } : null;
    previewRef.current = next;
    setPreview(next);
  }, []);

  const clearPreview = useCallback(() => showFile(null), [showFile]);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
      previewRef.current = null;
    },
    [],
  );

  return { previewUrl: preview?.url ?? null, showFile, clearPreview };
}
