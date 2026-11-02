import test from 'node:test';
import assert from 'node:assert/strict';
import { readDownloadBlob } from './mediaDownloads.js';

test('saved-file download without progress reads the response once', async () => {
  const response = new Response('video data', {
    headers: { 'content-length': '10', 'content-type': 'video/mp4' },
  });
  const blob = await readDownloadBlob(response);
  assert.equal(await blob.text(), 'video data');
  assert.equal(blob.type, 'video/mp4');
});

test('download with progress preserves all streamed bytes and media type', async () => {
  const progress = [];
  const response = new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2]));
      controller.enqueue(new Uint8Array([3, 4]));
      controller.close();
    },
  }), { headers: { 'content-length': '4', 'content-type': 'audio/mpeg' } });
  const blob = await readDownloadBlob(response, value => progress.push(value));
  assert.deepEqual([...new Uint8Array(await blob.arrayBuffer())], [1, 2, 3, 4]);
  assert.equal(blob.type, 'audio/mpeg');
  assert.deepEqual(progress, [50, 100]);
});

test('missing content length does not lock the fallback response body', async () => {
  const response = new Response('complete media');
  const blob = await readDownloadBlob(response, () => {});
  assert.equal(await blob.text(), 'complete media');
});

test('empty and failed responses are reported as failures', async () => {
  await assert.rejects(readDownloadBlob(new Response('')), /empty/);
  await assert.rejects(readDownloadBlob(new Response('missing', { status: 404 })), /404/);
});
