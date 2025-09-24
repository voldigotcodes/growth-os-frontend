import { memo } from 'react';

function WorkflowLibrary({ workflows, activeId, onSelect }) {
  return (
    <div className="glass-panel space-y-4 p-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold theme-text-primary">My Automations</h2>
        <p className="text-xs theme-text-muted">Load saved flows or revisit previous branches.</p>
      </header>
      {(!workflows || workflows.length === 0) && (
        <p className="text-sm theme-text-muted">Save your first workflow to build the library.</p>
      )}
      {workflows?.length ? (
        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
          {workflows.map((workflow) => {
            const timestamp = workflow.updated_at ?? workflow.created_at;
            return (
              <button
                key={workflow.id}
                type="button"
                onClick={() => onSelect?.(workflow.id)}
                className={`liquid-interactive flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm ${
                  activeId === workflow.id ? 'ring-2 ring-sky-300/60 bg-white/15' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-semibold theme-text-primary">{workflow.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] theme-text-muted">
                    Updated {timestamp ? new Date(timestamp).toLocaleString() : '—'}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] theme-text-muted">Load</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default memo(WorkflowLibrary);
