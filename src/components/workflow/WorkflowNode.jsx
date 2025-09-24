import { memo, useMemo } from 'react';
import Port from './Port.jsx';

function WorkflowNode({ data, selected }) {
  const {
    label,
    toolType,
    inputs = [],
    outputs = [],
    status = 'idle',
    highlight = [],
    validateConnection,
  } = data ?? {};

  const highlightSet = useMemo(() => new Set(highlight), [highlight]);

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
        </div>
        <span className="text-base drop-shadow-[0_3px_9px_rgba(15,23,42,0.45)]" aria-hidden>
          ⚙️
        </span>
      </header>

      {inputs.length ? (
        <div className="flex flex-col gap-2">
          {inputs.map((type, index) => (
            <Port
              key={`in-${type}-${index}`}
              id={`input-${type}-${index}`}
              type={type}
              kind="input"
              highlighted={highlightSet.has(`input-${type}-${index}`)}
              onValidate={validateConnection}
            />
          ))}
        </div>
      ) : null}

      {outputs.length ? (
        <div className="flex flex-col gap-2">
          {outputs.map((type, index) => (
            <Port
              key={`out-${type}-${index}`}
              id={`output-${type}-${index}`}
              type={type}
              kind="output"
              highlighted={highlightSet.has(`output-${type}-${index}`)}
              onValidate={validateConnection}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default memo(WorkflowNode);
