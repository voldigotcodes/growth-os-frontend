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
      className={`group flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-300 ease-out hover:scale-[1.01] focus:outline-none focus:ring-2 ${
        orientation === 'horizontal' ? 'min-w-[200px] flex-shrink-0' : ''
      } ${
        isDark
          ? 'border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/8 hover:border-white/15 focus:ring-white/20'
          : 'border-slate-200/50 bg-white/70 backdrop-blur-md hover:bg-white/80 hover:border-slate-300/60 focus:ring-sky-300/50'
      }`}
      aria-label={`Add ${tool.label}`}
    >
      <div className="flex items-start gap-3">
        {/* Simplified tool icon with consistent styling */}
        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base ${
          isDark ? 'bg-white/10' : 'bg-slate-200/60'
        } shadow-sm`}>
          {tool.icon ?? '✨'}
        </span>
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Standardized title typography */}
          <p className="text-sm font-medium theme-text-primary truncate">{tool.label}</p>
          {/* Standardized description with better line height */}
          <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
            {tool.description}
          </p>
          {/* Simplified port badges with standard sizing */}
          <div className={`flex flex-wrap gap-1.5 text-xs ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
            {(tool.ports?.inputs ?? []).length ? (
              <span className={`rounded-md border px-2 py-0.5 text-xs ${isDark ? 'border-white/15 bg-white/5' : 'border-slate-200/60 bg-slate-100/60'}`}>
                In: {tool.ports.inputs.map((port) => port.type).join(', ')}
              </span>
            ) : (
              <span className={`rounded-md border px-2 py-0.5 text-xs ${isDark ? 'border-white/15 bg-white/5' : 'border-slate-200/60 bg-slate-100/60'}`}>
                Source
              </span>
            )}
            {(tool.ports?.outputs ?? []).length ? (
              <span className={`rounded-md border px-2 py-0.5 text-xs ${isDark ? 'border-white/15 bg-white/5' : 'border-slate-200/60 bg-slate-100/60'}`}>
                Out: {tool.ports.outputs.map((port) => port.type).join(', ')}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {/* Simplified add indicator */}
      <span className={`text-xs uppercase tracking-wide transition-colors duration-300 ${
        isDark ? 'text-white/50 group-hover:text-white/70' : 'text-slate-500 group-hover:text-slate-700'
      }`}>
        Add
      </span>
    </button>
  );
}

function WorkflowPalette({ tools, onAdd, orientation = 'grid' }) {
  if (!tools?.length) {
    return (
      <div
        className={
          orientation === 'horizontal'
            ? 'rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm theme-text-muted backdrop-blur'
            : 'glass-panel p-6 text-sm theme-text-muted'
        }
      >
        No tools available yet.
      </div>
    );
  }

  if (orientation === 'horizontal') {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
      <div className={`rounded-lg border px-4 py-4 shadow-lg backdrop-blur-md ${
        isDark
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200/50 bg-white/80'
      }`}>
        <header className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium theme-text-primary">Tool Palette</h2>
            <p className="text-xs theme-text-muted">Drag or tap to add tools to canvas</p>
          </div>
        </header>
        {/* Improved horizontal scroll with better mobile handling */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
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
