import { trackEvent } from './apiClient.js';

const QUEUE = [];
let flushing = false;

export function trackUsage(eventType, metadata = {}) {
  QUEUE.push({ eventType, metadata, timestamp: Date.now() });
  if (!flushing) {
    flushQueue();
  }
}

async function flushQueue() {
  flushing = true;
  while (QUEUE.length) {
    const item = QUEUE.shift();
    try {
      await trackEvent(item.eventType, item.metadata);
    } catch (error) {
      console.warn('Telemetry failed, retrying later', error);
      QUEUE.push(item);
      break;
    }
  }
  flushing = false;
}

export function withTelemetry(callback, { eventType, metadata }) {
  return async (...args) => {
    trackUsage(eventType, metadata);
    return callback?.(...args);
  };
}
