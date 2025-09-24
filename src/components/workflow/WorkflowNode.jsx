import { memo, useMemo } from 'react';
import Port from './Port.jsx';

function WorkflowNode({ data, selected }) {
  const {
    label,
    toolType,
    description,
    inputs = [],
    outputs = [],
    config = {},
    status = 'idle',
    highlight = [],
    validateConnection,
  } = data ?? {};

  const highlightSet = useMemo(() => new Set(highlight), [highlight]);
  const inputPorts = Array.isArray(inputs) ? inputs : [];
  const outputPorts = Array.isArray(outputs) ? outputs : [];

  const statusRing =
    status === 'active'
      ? 'ring-2 ring-sky-300/70 shadow-[0_0_35px_rgba(56,189,248,0.45)] animate-pulse'
      : status === 'completed'
        ? 'ring-2 ring-emerald-300/70 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
        : 'shadow-[0_22px_55px_rgba(15,23,42,0.35)]';

  return (
    <div
      className={`glass-panel relative flex w-[256px] flex-col gap-4 rounded-3xl px-5 py-4 text-xs transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${
        selected ? 'scale-[1.03]' : 'scale-100'
      } ${statusRing}`}
      tabIndex={0}
      aria-label={`${label || toolType} node`}
    >
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold theme-text-primary">{label || 'Workflow Tool'}</p>
          <p className="text-[10px] uppercase tracking-[0.35em] theme-text-muted">{toolType}</p>
          {description ? (
            <p className="mt-1 text-[11px] text-white/70">{description}</p>
          ) : null}
        </div>
        <span className="text-base drop-shadow-[0_3px_9px_rgba(15,23,42,0.45)]" aria-hidden>
          ⚙️
        </span>
      </header>

      {inputPorts.length ? (
        <div className="flex flex-col gap-2">
          {inputPorts.map((port) => (
            <Port
              key={port.id}
              port={port}
              highlighted={highlightSet.has(port.id)}
              onValidate={validateConnection}
            />
          ))}
        </div>
      ) : null}

      {outputPorts.length ? (
        <div className="flex flex-col gap-2">
          {outputPorts.map((port) => (
            <Port
              key={port.id}
              port={port}
              highlighted={highlightSet.has(port.id)}
              onValidate={validateConnection}
            />
          ))}
        </div>
      ) : null}

      {config && Object.keys(config).length ? (
        <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-[11px] text-white/70">
          <p className="font-semibold uppercase tracking-[0.3em] text-white/60">Config</p>
          <ul className="mt-1 space-y-1">
            {Object.entries(config)
              .slice(0, 3)
              .map(([key, value]) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <span className="uppercase tracking-[0.3em] text-white/60">{key}</span>
                  <span className="truncate text-white/80">{String(value)}</span>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default memo(WorkflowNode);
