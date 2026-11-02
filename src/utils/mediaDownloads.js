/** Read a download once, with optional progress and the original media type. */
export async function readDownloadBlob(response, onProgress) {
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  const total = Number(response.headers.get('content-length'));
  let blob;
  if (onProgress && total > 0 && response.body) {
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        onProgress(Math.min(100, Math.round((loaded / total) * 100)));
      }
    } finally {
      reader.releaseLock();
    }
    blob = new Blob(chunks, { type: response.headers.get('content-type') || 'application/octet-stream' });
  } else {
    blob = await response.blob();
  }
  if (!blob.size) throw new Error('Downloaded file is empty.');
  return blob;
}
