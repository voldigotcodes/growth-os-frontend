import { memo } from 'react';

function WorkflowToolbar({ onSave, onRun, onDeleteSelection, onClear, running, saving }) {
  return (
    <div className="glass-panel glass-static flex flex-wrap items-center gap-3 rounded-3xl px-5 py-4 text-xs shadow-[0_18px_45px_rgba(15,23,42,0.25)]">
      <button
        type="button"
        className="liquid-button text-xs bg-transparent border-sky-400/45 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:bg-sky-500/10"
        onClick={onSave}
        disabled={saving}
        aria-disabled={saving}
      >
        {saving ? 'Saving…' : 'Save Workflow'}
      </button>
      <button
        type="button"
        className="liquid-button text-xs bg-transparent border-emerald-400/45 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:bg-emerald-500/10"
        onClick={onRun}
        disabled={running}
        aria-disabled={running}
      >
        {running ? 'Running…' : 'Run Workflow'}
      </button>
      <button
        type="button"
        className="liquid-button text-xs bg-transparent border-white/20 text-white/80 hover:bg-white/10"
        onClick={onDeleteSelection}
        disabled={false}
        aria-disabled="false"
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
