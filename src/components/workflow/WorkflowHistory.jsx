import { memo } from 'react';

function statusIcon(status) {
  switch (status) {
    case 'running':
      return '💡';
    case 'failed':
      return '⚠️';
    default:
      return '✅';
  }
}

function WorkflowHistory({ history = [], onSelect, onRerun, onOpenOutputs, onViewLogs }) {
  const formatCredits = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseFloat(value.trim());
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof value === 'object') {
      const candidates = [value.consumed, value.workflow_runs, value.credits_consumed];
      for (const candidate of candidates) {
        if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
      }
    }
    return null;
  };

  return (
    <div className="glass-panel space-y-4 p-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold theme-text-primary">Latest Runs</h2>
        <p className="text-xs theme-text-muted">Track outcomes, credits, and outputs for each execution.</p>
      </header>
      {history.length === 0 ? (
        <p className="text-sm theme-text-muted">Run a workflow to see execution history here.</p>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect?.(entry)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect?.(entry);
                }
              }}
              className="liquid-interactive flex w-full flex-col gap-3 rounded-2xl px-4 py-3 text-left text-sm hover:ring-sky-200/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>{statusIcon(entry.status)}</span>
                  <div>
                    <p className="font-semibold theme-text-primary">{entry.workflowName}</p>
                    <p className="text-[11px] uppercase tracking-[0.3em] theme-text-muted">
                      {new Date(entry.startedAt).toLocaleString()} · {entry.durationLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] uppercase tracking-[0.3em] theme-text-muted">
                  <p>{entry.status === 'failed' ? 'Review' : 'View'}</p>
                  {formatCredits(entry.credits) !== null && (
                    <p className="mt-1 text-white/70">-{formatCredits(entry.credits)} credits</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/70">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRerun?.(entry);
                  }}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-emerald-300/60 hover:text-emerald-200"
                >
                  Rerun
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenOutputs?.(entry);
                  }}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-sky-300/60 hover:text-sky-200"
                >
                  Open Outputs
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewLogs?.(entry);
                  }}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-pink-300/60 hover:text-pink-200"
                >
                  View Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(WorkflowHistory);
