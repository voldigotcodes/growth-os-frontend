import { memo, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import ContextMenu from '../ContextMenu.jsx';
import Port from './Port.jsx';

const getStatusStyles = (isDark) => ({
  active: isDark
    ? 'bg-sky-500/15 text-sky-200 border-sky-300/50'
    : 'bg-sky-100/80 text-sky-700 border-sky-400/60',
  completed: isDark
    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-300/50'
    : 'bg-emerald-100/80 text-emerald-700 border-emerald-400/60',
  idle: isDark
    ? 'bg-white/10 text-white/60 border-white/20'
    : 'bg-slate-100/80 text-slate-600 border-slate-300/60',
  failed: isDark
    ? 'bg-rose-500/15 text-rose-200 border-rose-300/50'
    : 'bg-rose-100/80 text-rose-700 border-rose-400/60',
});

function WorkflowNode({ data, selected }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    label,
    toolType,
    description,
    inputs = [],
    outputs = [],
    icon = '⚙️',
    status = 'idle',
    highlight = [],
    validateConnection,
  } = data ?? {};

  const highlightSet = useMemo(() => new Set(highlight), [highlight]);
  const inputPorts = Array.isArray(inputs) ? inputs : [];
  const outputPorts = Array.isArray(outputs) ? outputs : [];
  const statusStyles = getStatusStyles(isDark);
  const statusStyle = statusStyles[status] ?? statusStyles.idle;

  const contextMenuItems = [
    { icon: '⚙️', label: 'Configure', action: () => console.log('Configure node') },
    { icon: '📊', label: 'View Logs', action: () => console.log('View logs') },
    { icon: '🔄', label: 'Reset', action: () => console.log('Reset node') },
    { type: 'separator' },
    { icon: '🗑️', label: 'Delete', action: () => console.log('Delete node'), destructive: true }
  ];

  return (
    <div
      className={`glass-panel relative flex w-[240px] flex-col gap-4 rounded-lg px-4 py-4 text-xs transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-sky-300/50 ${
        selected ? 'scale-[1.02] shadow-lg' : 'scale-100'
      }`}
      tabIndex={0}
      aria-label={`${label || toolType} node`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Simplified icon badge - single size, reduced shadow, consistent background */}
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${
            isDark ? 'bg-white/12' : 'bg-slate-200/60'
          } shadow-sm`}>
            {icon}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium theme-text-primary">{label || 'Workflow Tool'}</p>
            <p className={`text-xs leading-snug ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{description || toolType}</p>
          </div>
        </div>
        {/* Simplified status chip with improved contrast */}
        <div className="flex items-center gap-2">
          <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${statusStyle}`}>
            {status}
          </span>
          <ContextMenu
            items={contextMenuItems}
            placement="bottom-left"
            trigger={
              <button className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200/60'}`}>
                <span className="text-sm">⋯</span>
              </button>
            }
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {inputPorts.length ? (
          <div className="space-y-2">
            {/* Simplified port section header */}
            <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Inputs</p>
            <div className="space-y-1.5">
              {inputPorts.map((port) => (
                <Port
                  key={port.id}
                  port={port}
                  highlighted={highlightSet.has(port.id)}
                  onValidate={validateConnection}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        ) : null}
        {outputPorts.length ? (
          <div className="space-y-2">
            {/* Simplified port section header */}
            <p className={`text-xs font-medium uppercase tracking-wide text-right ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Outputs</p>
            <div className="space-y-1.5">
              {outputPorts.map((port) => (
                <Port
                  key={port.id}
                  port={port}
                  highlighted={highlightSet.has(port.id)}
                  onValidate={validateConnection}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default memo(WorkflowNode);
