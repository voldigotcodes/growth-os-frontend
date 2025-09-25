import { useCallback, useEffect, useRef } from 'react';
import { useFeatureFlags } from '../context/FeatureFlagContext.jsx';
import { trackUsage } from '../lib/telemetry.js';

const STORAGE_KEY = 'growth-os-defaults';

function loadDefaults() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to load defaults', error);
  }
  return {};
}

function persistDefaults(defaults) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch (error) {
    console.warn('Unable to persist defaults', error);
  }
}

export default function useSmartDefaults(scope) {
  const { flags } = useFeatureFlags();
  const defaultsRef = useRef(loadDefaults());

  const applyDefaults = useCallback(
    (current) => {
      if (!flags.smartDefaults) return current;
      const scopedDefaults = defaultsRef.current[scope] ?? {};
      return { ...scopedDefaults, ...current };
    },
    [flags.smartDefaults, scope]
  );

  const remember = useCallback(
    (value) => {
      if (!flags.smartDefaults) return;
      defaultsRef.current = {
        ...defaultsRef.current,
        [scope]: { ...defaultsRef.current[scope], ...value },
      };
      persistDefaults(defaultsRef.current);
      trackUsage('smart_default_updated', { scope, keys: Object.keys(value) });
    },
    [flags.smartDefaults, scope]
  );

  useEffect(() => {
    if (!flags.smartDefaults) return;
    defaultsRef.current = loadDefaults();
  }, [flags.smartDefaults]);

  return { applyDefaults, remember };
}
