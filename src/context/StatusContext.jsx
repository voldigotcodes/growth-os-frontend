import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const StatusContext = createContext({
  status: {},
  setStatus: () => {},
  clearStatus: () => {},
});

export function StatusProvider({ children }) {
  const [status, setStatusState] = useState({});

  const setStatus = useCallback((key, value) => {
    setStatusState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearStatus = useCallback((key) => {
    setStatusState((prev) => {
      if (!key) return {};
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const value = useMemo(() => ({ status, setStatus, clearStatus }), [status, setStatus, clearStatus]);

  return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
}

export function useStatus(key) {
  const context = useContext(StatusContext);
  return [context.status?.[key], (value) => context.setStatus(key, value)];
}

export function useStatusContext() {
  return useContext(StatusContext);
}

export default StatusContext;
