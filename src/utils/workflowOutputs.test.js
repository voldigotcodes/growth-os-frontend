import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchDownloadBlob, generateOutputFilename, getDownloadableOutputs, getFileExtension, getOutputUrl, resolveDownloadUrl } from './workflowOutputs.js';

const apiBase = 'http://localhost:8001';

test('relative media URLs target the backend while absolute URLs retain their host', () => {
  assert.equal(resolveDownloadUrl('/media/copy.txt', apiBase), `${apiBase}/media/copy.txt`);
  assert.equal(resolveDownloadUrl('media/copy.txt', apiBase + '/'), `${apiBase}/media/copy.txt`);
  assert.equal(resolveDownloadUrl('https://cdn.example/audio.mp3', apiBase), 'https://cdn.example/audio.mp3');
  assert.throws(() => resolveDownloadUrl('javascript:alert(1)', apiBase));
});

test('workflow output variants retain file extensions including relative encoded URLs', () => {
  for (const output of [{ url: '/media/a.mp3' }, { file_url: '/media/a.mp3' }, { value: { url: '/media/a.mp3' } }, { value: { file_url: '/media/a.mp3' } }]) {
    assert.equal(getOutputUrl(output), '/media/a.mp3');
    assert.match(generateOutputFilename({ ...output, label: 'Voice Track' }), /\.mp3$/);
  }
  assert.equal(getFileExtension('/media/my%20copy.txt?version=2'), '.txt');
  assert.equal(generateOutputFilename({ filename: 'copy.txt', url: '/media/copy.txt' }), 'copy.txt');
  assert.equal(generateOutputFilename({ label: 'Copy / Final', value: { url: '/media/copy.txt' } }), 'Copy - Final.txt');
});

test('selection indexes use the filtered list when a publisher status precedes downloadable files', () => {
  const selectable = getDownloadableOutputs([{ value: { status: 'queued' } }, { label: 'Copy', value: { url: '/media/copy.txt' } }, { file_url: '/media/voice.wav' }]);
  assert.equal(selectable.length, 2);
  assert.equal(getOutputUrl(selectable[0]), '/media/copy.txt');
  assert.equal(getOutputUrl(selectable[1]), '/media/voice.wav');
});

test('workflow downloads retrieve file bytes from the API address', async () => {
  let destination;
  const blob = await fetchDownloadBlob('/media/copy.txt', apiBase, {
    fetchImpl: async url => { destination = url; return new Response('Generated copy', { headers: { 'content-type': 'text/plain' } }); },
  });
  assert.equal(destination, `${apiBase}/media/copy.txt`);
  assert.equal(await blob.text(), 'Generated copy');
});

test('HTML frontend responses and missing files are reported as failures', async () => {
  await assert.rejects(fetchDownloadBlob('/media/a.mp3', apiBase, {
    fetchImpl: async () => new Response('<html>Vite app</html>', { headers: { 'content-type': 'text/html' } }),
  }), /web page/);
  await assert.rejects(fetchDownloadBlob('/media/a.mp3', apiBase, {
    fetchImpl: async () => new Response('Missing', { status: 404 }),
  }), /404/);
});
