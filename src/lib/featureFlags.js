const DEFAULT_FLAGS = {
  progressiveDisclosure: true,
  smartDefaults: true,
  globalSearch: true,
  consolidatedActions: true,
  telemetry: true,
};

const STORAGE_KEY = 'growth-os-feature-flags';

export function loadFeatureFlags() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Unable to read feature flags from storage', error);
  }
  return { ...DEFAULT_FLAGS };
}

export function saveFeatureFlags(flags) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch (error) {
    console.warn('Unable to persist feature flags', error);
  }
}

export function isFlagEnabled(flags, flag) {
  return Boolean(flags?.[flag]);
}

export function mergedFlags(flags = {}) {
  return { ...DEFAULT_FLAGS, ...flags };
}

export const featureFlagList = Object.keys(DEFAULT_FLAGS).map((key) => ({
  id: key,
  label: key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase()),
  defaultValue: DEFAULT_FLAGS[key],
}));
