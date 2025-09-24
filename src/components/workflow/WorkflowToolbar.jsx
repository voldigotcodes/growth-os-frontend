import { memo } from 'react';

function WorkflowToolbar({
  onSave,
  onRun,
  onDeleteSelection,
  onClear,
  running,
  saving,
  canRun,
  estimatedCost,
  hasSelection,
}) {
  return (
    <div className="glass-panel glass-static flex flex-wrap items-center gap-3 rounded-3xl px-5 py-4 text-xs shadow-[0_18px_45px_rgba(15,23,42,0.25)] relative z-50">
      <button
        type="button"
        className="liquid-button text-xs bg-transparent border-sky-400/45 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:bg-sky-500/10 disabled:cursor-wait disabled:opacity-60"
        onClick={onSave}
        disabled={saving}
        aria-disabled={saving}
      >
        {saving ? 'Saving…' : 'Save Workflow'}
      </button>
      <button
        type="button"
        className="liquid-button text-xs bg-transparent border-emerald-400/45 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onRun}
        disabled={running || !canRun}
        aria-disabled={running || !canRun}
      >
        {running ? 'Running…' : `Run Workflow${estimatedCost ? ` · ${estimatedCost}` : ''}`}
      </button>
      <button
        type="button"
        className="liquid-button text-xs bg-transparent border-white/20 text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onDeleteSelection}
        disabled={!hasSelection}
        aria-disabled={!hasSelection}
      >
        Delete Selected (⌫)
      </button>
      <button
        type="button"
        className="liquid-button text-xs bg-transparent border-rose-400/45 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-500/10"
        onClick={onClear}
      >
        Clear Workflow
      </button>
    </div>
  );
}

export default memo(WorkflowToolbar);
