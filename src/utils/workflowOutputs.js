import { readDownloadBlob } from './mediaDownloads.js';

export function getOutputUrl(output) {
  return [output?.file_url, output?.url, output?.value?.file_url, output?.value?.url]
    .find(value => typeof value === 'string' && value.trim())?.trim() || '';
}

export const isDownloadableOutput = output => Boolean(getOutputUrl(output));
export const getDownloadableOutputs = outputs => (outputs || []).filter(isDownloadableOutput);

export function resolveDownloadUrl(url, apiBase) {
  const value = typeof url === 'string' ? url.trim() : '';
  if (!value) throw new Error('Output has no downloadable URL.');
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//')) {
    throw new Error('Unsupported download URL.');
  }
  return `${apiBase.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}

export function getFileExtension(url) {
  try {
    const path = new URL(url, 'https://workflow.invalid').pathname;
    const name = decodeURIComponent(path.split('/').pop());
    return name.match(/\.[a-z0-9]{1,10}$/i)?.[0] || '';
  } catch {
    return '';
  }
}

export function generateOutputFilename(output) {
  const extension = getFileExtension(getOutputUrl(output));
  const name = output?.filename || output?.value?.filename || output?.label || `${output?.node_id || 'output'}-${output?.port_id || 'result'}`;
  const safe = String(name).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/[. ]+$/, '') || 'output';
  return extension && !safe.toLowerCase().endsWith(extension.toLowerCase()) ? safe + extension : safe;
}

export async function fetchDownloadBlob(url, apiBase, { headers = {}, onProgress, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(resolveDownloadUrl(url, apiBase), { headers });
  if (response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('Received a web page instead of the workflow file. Check the backend URL and rerun if the file is missing.');
  }
  return readDownloadBlob(response, onProgress);
}
