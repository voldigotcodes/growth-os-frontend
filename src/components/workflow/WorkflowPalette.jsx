import { memo } from 'react';

function WorkflowPalette({ tools, onAdd }) {
  if (!tools?.length) {
    return (
      <div className="glass-panel p-6 text-sm theme-text-muted">
        No tools available yet.
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-4 p-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold theme-text-primary">Tool Palette</h2>
        <p className="text-xs theme-text-muted">Drag tools into the canvas or tap to drop them in view.</p>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('application/reactflow', JSON.stringify(tool));
              event.dataTransfer.setData('text/plain', tool.type);
              event.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => onAdd?.(tool)}
            className="liquid-interactive flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs"
            aria-label={`Add ${tool.label}`}
          >
            <span className="text-base" aria-hidden>
              {tool.icon ?? '✨'}
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-semibold theme-text-primary">{tool.label}</p>
              <div className="flex flex-wrap gap-1 text-[10px] uppercase tracking-[0.3em] theme-text-muted">
                {tool.inputs?.length ? (
                  <span className="rounded-full border border-white/15 px-2 py-[2px]">In: {tool.inputs.join(', ')}</span>
                ) : (
                  <span className="rounded-full border border-white/15 px-2 py-[2px]">Source</span>
                )}
                {tool.outputs?.length ? (
                  <span className="rounded-full border border-white/15 px-2 py-[2px]">Out: {tool.outputs.join(', ')}</span>
                ) : null}
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] theme-text-muted">Add</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(WorkflowPalette);
