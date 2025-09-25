import { memo, useState } from 'react';

const baseButton =
  'inline-flex items-center justify-center rounded-2xl border px-5 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed';

const variants = {
  primary: `${baseButton} border-sky-400/60 text-sky-100 hover:bg-sky-500/15`,
  success: `${baseButton} border-emerald-400/60 text-emerald-100 hover:bg-emerald-500/15`,
  neutral: `${baseButton} border-white/25 text-white/80 hover:bg-white/15`,
  danger: `${baseButton} border-rose-400/60 text-rose-200 hover:bg-rose-500/15`,
};

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
  showDelete = true,
  showClear = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const showOverflow = !showDelete || !showClear;

  return (
    <div className="glass-panel glass-static relative flex flex-wrap items-center gap-4 rounded-3xl px-6 py-4 text-sm shadow-[0_18px_45px_rgba(15,23,42,0.25)]">
      <button
        type="button"
        className={variants.primary}
        onClick={onSave}
        disabled={saving}
        aria-disabled={saving}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button
        type="button"
        className={variants.success}
        onClick={onRun}
        disabled={running || !canRun}
        aria-disabled={running || !canRun}
      >
        {running ? 'Running…' : `Run${estimatedCost ? ` · ${estimatedCost}` : ''}`}
      </button>
      {showDelete ? (
        <button
          type="button"
          className={variants.neutral}
          onClick={onDeleteSelection}
          disabled={!hasSelection}
          aria-disabled={!hasSelection}
        >
          Delete Selection
        </button>
      ) : null}
      {showClear ? (
        <button
          type="button"
          className={variants.danger}
          onClick={onClear}
        >
          Clear Canvas
        </button>
      ) : null}
      {showOverflow ? (
        <div className="relative">
          <button
            type="button"
            className={variants.neutral}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            Manage Canvas
          </button>
          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/15 bg-slate-950/85 p-2 text-xs text-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.35)]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteSelection?.();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 hover:bg-white/10"
              >
                Delete Selection
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">⌘/Ctrl + ⌫</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onClear?.();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 hover:bg-white/10"
              >
                Clear Canvas
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default memo(WorkflowToolbar);
