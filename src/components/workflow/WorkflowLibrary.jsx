import { memo } from 'react';
import EmptyState from '../EmptyState.jsx';

function WorkflowLibrary({ workflows, activeId, onSelect, onDelete, onDeleteAll }) {
  return (
    <div className="glass-panel space-y-4 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold theme-text-primary">My Automations</h2>
          <p className="text-xs theme-text-muted">Load saved flows or revisit previous branches.</p>
        </div>
        {workflows?.length ? (
          <button
            type="button"
            onClick={onDeleteAll}
            className="text-[10px] uppercase tracking-[0.3em] text-white/60 transition hover:text-rose-200"
          >
            Clear All
          </button>
        ) : null}
      </header>
      {(!workflows || workflows.length === 0) && (
        <EmptyState
          title="No automations yet"
          description="Save a workflow to keep quick access to your favourite automations."
        />
      )}
      {workflows?.length ? (
        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
          {workflows.map((workflow) => {
            const timestamp = workflow.updated_at ?? workflow.created_at;
            return (
              <div
                key={workflow.id}
                className={`group relative rounded-2xl ${
                  activeId === workflow.id ? 'ring-2 ring-sky-300/60 bg-white/15' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect?.(workflow.id)}
                  className={`liquid-interactive flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm ${
                    activeId === workflow.id ? 'bg-transparent' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold theme-text-primary">{workflow.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                      {timestamp ? new Date(timestamp).toLocaleString() : 'Draft'}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(workflow.id)}
                  className="absolute -right-2 -top-2 hidden h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-slate-900/70 text-base text-white/80 shadow-lg transition group-hover:flex hover:bg-rose-500/80"
                  aria-label={`Delete ${workflow.name}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default memo(WorkflowLibrary);
