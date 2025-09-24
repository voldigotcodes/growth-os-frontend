import { Fragment, memo } from 'react';

function statusBadge(status) {
  switch (status) {
    case 'failed':
      return 'text-rose-300 bg-rose-500/15';
    case 'running':
      return 'text-sky-200 bg-sky-500/15';
    default:
      return 'text-emerald-200 bg-emerald-500/15';
  }
}

function RunSummaryDrawer({ open, onClose, summary }) {
  if (!open) return null;

  const steps = summary?.node_trace ?? [];
  const edges = summary?.edge_trace ?? [];

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="glass-panel liquid relative z-50 flex h-full w-full max-w-lg flex-col overflow-hidden px-8 py-10 shadow-[0_40px_80px_rgba(15,23,42,0.45)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-sm uppercase tracking-[0.35em] text-white/60 hover:text-white"
        >
          Close
        </button>
        <header className="space-y-3 pr-10">
          <h2 className="text-2xl font-semibold text-white">Run Summary</h2>
          <p className="text-sm text-white/70">
            {summary?.workflow?.name ?? 'Workflow'} · {new Date(summary?.startedAt ?? Date.now()).toLocaleString()}
          </p>
          {summary?.credits_info && (
            <div className="text-xs uppercase tracking-[0.35em] text-white/60">
              Credits used: {summary.credits_info.consumed} · Remaining: {summary.credits_info.remaining}
            </div>
          )}
          {summary?.error ? (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
              {summary.error}
            </div>
          ) : null}
        </header>

        <section className="mt-6 space-y-4 overflow-y-auto pr-3">
          {steps.length === 0 ? (
            <p className="text-sm text-white/70">No execution trace returned.</p>
          ) : (
            steps.map((step, index) => (
              <Fragment key={step.node_id}>
                <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/80">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white/90">
                      Step {index + 1}: {step.label ?? step.tool}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.3em] ${statusBadge(step.status ?? 'completed')}`}>
                      {step.status ?? 'completed'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/70">Tool: {step.tool}</p>
                  {step.outputs ? (
                    <p className="mt-1 text-xs text-white/60">
                      Outputs: {Array.isArray(step.outputs)
                        ? step.outputs.join(', ')
                        : Object.keys(step.outputs).join(', ')}
                    </p>
                  ) : null}
                </div>
                {index < steps.length - 1 ? (
                  <div className="flex items-center justify-center text-white/40">
                    <svg width="6" height="60" viewBox="0 0 6 60" fill="none">
                      <path d="M3 0v60" stroke="currentColor" strokeDasharray="6 6" strokeLinecap="round" />
                    </svg>
                  </div>
                ) : null}
              </Fragment>
            ))
          )}
        </section>

        {summary?.outputs?.length ? (
          <section className="mt-6 space-y-2 text-sm text-white/80">
            <h3 className="text-base font-semibold text-white">Generated Outputs</h3>
            <ul className="space-y-2">
              {summary.outputs.map((output) => {
                const url = output?.url ?? output?.value?.url;
                const label = output?.label ?? `${output.node_id} · ${output.port_id}`;
                return (
                  <li key={`${output.node_id}-${output.port_id}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/8 px-3 py-2">
                    <span className="truncate text-xs text-white/75">{label}</span>
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer" className="text-xs uppercase tracking-[0.3em] text-sky-200">
                        Open
                      </a>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.3em] text-white/50">No link</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default memo(RunSummaryDrawer);
