import { Fragment, memo, useMemo } from 'react';
import { downloadOutputWithNotification, isDownloadableOutput, generateOutputFilename } from '../../utils/downloadHelpers.js';
import { useToast } from '../ToastContext.jsx';

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

function normalizeCredits(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseFloat(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 1) {
      return normalizeCredits(value[keys[0]]);
    }
    return keys
      .map((key) => `${key}: ${normalizeCredits(value[key]) ?? '—'}`)
      .join(' • ');
  }
  return null;
}

function RunSummaryDrawer({ open, onClose, summary }) {
  const { addToast } = useToast();

  if (!open) return null;

  const steps = summary?.node_trace ?? [];
  const edges = summary?.edge_trace ?? [];
  const creditsUsed = useMemo(() => normalizeCredits(summary?.credits_info?.consumed), [summary]);
  const creditsRemaining = useMemo(() => normalizeCredits(summary?.credits_info?.remaining), [summary]);

  // Debug mode toggle (can be controlled via URL param or localStorage)
  const debugMode = new URLSearchParams(window.location.search).has('debug') ||
                    localStorage.getItem('workflow-debug') === 'true';

  const handleDownload = async (output) => {
    if (debugMode) {
      console.log('🔍 Debug Mode: Downloading output:', output);
    }

    await downloadOutputWithNotification(output, addToast, debugMode);
  };

  const handleDebugToggle = () => {
    const newDebugState = !debugMode;
    if (newDebugState) {
      localStorage.setItem('workflow-debug', 'true');
      addToast('Debug mode enabled - check console for download details', 'info');
    } else {
      localStorage.removeItem('workflow-debug');
      addToast('Debug mode disabled', 'info');
    }
    // Reload to apply changes
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xl">
      <div className="glass-panel liquid relative flex h-full w-full max-w-lg flex-col overflow-hidden px-8 py-10 shadow-[0_40px_80px_rgba(15,23,42,0.45)]">
        <div className="absolute right-6 top-6 flex gap-3">
          <button
            type="button"
            onClick={handleDebugToggle}
            className={`text-xs uppercase tracking-[0.35em] transition-colors ${
              debugMode
                ? 'text-orange-300 hover:text-orange-200'
                : 'text-white/40 hover:text-white/60'
            }`}
            title={debugMode ? 'Disable debug mode' : 'Enable debug mode'}
          >
            Debug
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm uppercase tracking-[0.35em] text-white/60 hover:text-white"
          >
            Close
          </button>
        </div>
        <header className="space-y-3 pr-10">
          <h2 className="text-2xl font-semibold text-white">Run Summary</h2>
          <p className="text-sm text-white/70">
            {summary?.workflow?.name ?? 'Workflow'} · {new Date(summary?.startedAt ?? Date.now()).toLocaleString()}
          </p>
          {(creditsUsed !== null || creditsRemaining !== null) && (
            <div className="text-xs uppercase tracking-[0.35em] text-white/60">
              {creditsUsed !== null ? `Credits used: ${creditsUsed}` : 'Credits used: —'}
              {creditsRemaining !== null ? ` · Remaining: ${creditsRemaining}` : ''}
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Generated Outputs</h3>
              {debugMode && (
                <div className="text-xs text-orange-300/70 font-mono">
                  Debug ON
                </div>
              )}
            </div>
            <ul className="space-y-2">
              {summary.outputs.map((output) => {
                const url = output?.url ?? output?.value?.url;
                const label = output?.label ?? `${output.node_id} · ${output.port_id}`;
                const filename = generateOutputFilename(output);
                const hasValidUrl = isDownloadableOutput(output);

                return (
                  <li key={`${output.node_id}-${output.port_id}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/8 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs text-white/75">{label}</div>
                      <div className="truncate text-[10px] text-white/50 mt-0.5">{filename}</div>
                      {debugMode && (
                        <div className="text-[9px] text-orange-300/70 mt-1 font-mono">
                          URL: {url ? url.substring(0, 60) + '...' : 'None'}
                        </div>
                      )}
                    </div>
                    {hasValidUrl ? (
                      <button
                        type="button"
                        onClick={() => handleDownload(output)}
                        className="text-xs uppercase tracking-[0.3em] text-sky-200 hover:text-sky-100 transition-colors"
                      >
                        Download
                      </button>
                    ) : (
                      <div className="text-center">
                        <span className="text-xs uppercase tracking-[0.3em] text-red-400/70">No URL</span>
                        {debugMode && (
                          <div className="text-[9px] text-red-300/50 mt-1">Check console</div>
                        )}
                      </div>
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
