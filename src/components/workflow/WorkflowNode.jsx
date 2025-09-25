import { memo, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import Port from './Port.jsx';

const getStatusStyles = (isDark) => ({
  active: isDark
    ? 'bg-sky-500/15 text-sky-200 border-sky-300/50'
    : 'bg-sky-100/80 text-sky-700 border-sky-400/60',
  completed: isDark
    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-300/50'
    : 'bg-emerald-100/80 text-emerald-700 border-emerald-400/60',
  idle: isDark
    ? 'bg-white/10 text-white/60 border-white/20'
    : 'bg-slate-100/80 text-slate-600 border-slate-300/60',
  failed: isDark
    ? 'bg-rose-500/15 text-rose-200 border-rose-300/50'
    : 'bg-rose-100/80 text-rose-700 border-rose-400/60',
});

function WorkflowNode({ data, selected }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    label,
    toolType,
    description,
    inputs = [],
    outputs = [],
    icon = '⚙️',
    status = 'idle',
    highlight = [],
    validateConnection,
  } = data ?? {};

  const highlightSet = useMemo(() => new Set(highlight), [highlight]);
  const inputPorts = Array.isArray(inputs) ? inputs : [];
  const outputPorts = Array.isArray(outputs) ? outputs : [];
  const statusStyles = getStatusStyles(isDark);
  const statusStyle = statusStyles[status] ?? statusStyles.idle;

  return (
    <div
      className={`glass-panel relative flex w-[240px] flex-col gap-4 rounded-3xl px-5 py-4 text-xs transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${
        selected ? 'scale-[1.03]' : 'scale-100'
      }`}
      tabIndex={0}
      aria-label={`${label || toolType} node`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-lg shadow-[0_8px_20px_rgba(15,23,42,0.35)]">
            {icon}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold theme-text-primary">{label || 'Workflow Tool'}</p>
            <p className={`text-[11px] ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{description || toolType}</p>
          </div>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] ${statusStyle}`}
        >
          {status}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {inputPorts.length ? (
          <div className="space-y-2">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Inputs</p>
            <div className="space-y-2">
              {inputPorts.map((port) => (
                <Port
                  key={port.id}
                  port={port}
                  highlighted={highlightSet.has(port.id)}
                  onValidate={validateConnection}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        ) : null}
        {outputPorts.length ? (
          <div className="space-y-2">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.3em] text-right ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Outputs</p>
            <div className="space-y-2">
              {outputPorts.map((port) => (
                <Port
                  key={port.id}
                  port={port}
                  highlighted={highlightSet.has(port.id)}
                  onValidate={validateConnection}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default memo(WorkflowNode);
