import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loadFeatureFlags, saveFeatureFlags, mergedFlags } from '../lib/featureFlags.js';
import { trackUsage } from '../lib/telemetry.js';

const FeatureFlagContext = createContext({
  flags: mergedFlags(),
  toggleFlag: () => {},
  setFlag: () => {},
});

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(() => mergedFlags(loadFeatureFlags()));

  const setFlag = useCallback((key, value) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: value };
      saveFeatureFlags(next);
      trackUsage('feature_flag_updated', { flag: key, value });
      return next;
    });
  }, []);

  const toggleFlag = useCallback((key) => {
    setFlag(key, !flags[key]);
  }, [flags, setFlag]);

  const value = useMemo(() => ({ flags, toggleFlag, setFlag }), [flags, setFlag, toggleFlag]);

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}

export default FeatureFlagContext;
