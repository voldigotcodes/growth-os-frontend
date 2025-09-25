import { memo } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

function ToolCard({ tool, onAdd, orientation }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const handleDrag = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(tool));
    event.dataTransfer.setData('text/plain', tool.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <button
      key={tool.type}
      type="button"
      draggable
      onDragStart={handleDrag}
      onClick={() => onAdd?.(tool)}
      className={`liquid-interactive flex items-start justify-between gap-4 rounded-2xl px-4 py-3 text-left text-xs backdrop-blur ${
        orientation === 'horizontal' ? 'min-w-[220px]' : ''
      }`}
      aria-label={`Add ${tool.label}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-base shadow-[0_6px_18px_rgba(15,23,42,0.35)]">
          {tool.icon ?? '✨'}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold theme-text-primary">{tool.label}</p>
          <p className={`text-[11px] line-clamp-2 ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{tool.description}</p>
          <div className={`flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
            {(tool.ports?.inputs ?? []).length ? (
              <span className={`rounded-full border px-2 py-[2px] ${isDark ? 'border-white/20' : 'border-slate-300/40'}`}>
                In {tool.ports.inputs.map((port) => port.type).join(', ')}
              </span>
            ) : (
              <span className={`rounded-full border px-2 py-[2px] ${isDark ? 'border-white/20' : 'border-slate-300/40'}`}>Source</span>
            )}
            {(tool.ports?.outputs ?? []).length ? (
              <span className={`rounded-full border px-2 py-[2px] ${isDark ? 'border-white/20' : 'border-slate-300/40'}`}>
                Out {tool.ports.outputs.map((port) => port.type).join(', ')}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <span className={`text-[10px] uppercase tracking-[0.3em] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Add</span>
    </button>
  );
}

function WorkflowPalette({ tools, onAdd, orientation = 'grid' }) {
  if (!tools?.length) {
    return (
      <div
        className={
          orientation === 'horizontal'
            ? 'rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-sm theme-text-muted backdrop-blur'
            : 'glass-panel p-6 text-sm theme-text-muted'
        }
      >
        No tools available yet.
      </div>
    );
  }

  if (orientation === 'horizontal') {
    return (
      <div className="rounded-3xl border border-white/12 bg-white/8 px-4 py-5 shadow-[0_25px_55px_rgba(15,23,42,0.28)] backdrop-blur">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold theme-text-primary">Tool Palette</h2>
            <p className="text-xs theme-text-muted">Drag or tap to drop tools onto the canvas.</p>
          </div>
        </header>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {tools.map((tool) => (
            <ToolCard key={tool.type} tool={tool} onAdd={onAdd} orientation="horizontal" />
          ))}
        </div>
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
          <ToolCard key={tool.type} tool={tool} onAdd={onAdd} orientation="grid" />
        ))}
      </div>
    </div>
  );
}

export default memo(WorkflowPalette);
