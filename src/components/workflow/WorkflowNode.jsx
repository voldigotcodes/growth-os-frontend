import { memo, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import ContextMenu from '../ContextMenu.jsx';
import Port from './Port.jsx';
import { glassWorkflow } from '../../utils/glassUI.js';

// Status styles
const getStatusStyles = (isDark) => ({
  active: `px-2.5 py-1 text-xs font-medium uppercase tracking-wide rounded-full ${isDark ? 'bg-sky-900/50 text-sky-300 border border-sky-700' : 'bg-sky-100 text-sky-700 border border-sky-200'}`,
  completed: `px-2.5 py-1 text-xs font-medium uppercase tracking-wide rounded-full ${isDark ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`,
  idle: `px-2.5 py-1 text-xs font-medium uppercase tracking-wide rounded-full ${isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'}`,
  failed: `px-2.5 py-1 text-xs font-medium uppercase tracking-wide rounded-full ${isDark ? 'bg-rose-900/50 text-rose-300 border border-rose-700' : 'bg-rose-100 text-rose-700 border border-rose-200'}`,
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

  // Node container styling
  const nodeClasses = selected
    ? `${glassWorkflow.node} ring-2 ring-fuchsia-400/50 shadow-xl`
    : glassWorkflow.node;

  return (
    <div
      className={nodeClasses}
      tabIndex={0}
      aria-label={`${label || toolType} node`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Icon badge */}
          <div className={`flex h-10 w-10 items-center justify-center text-base rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium theme-text-primary">{label || 'Workflow Tool'}</p>
            <p className="text-xs leading-snug theme-text-secondary">{description || toolType}</p>
          </div>
        </div>
        {/* Status chip */}
        <div className="flex items-center gap-2">
          <span className={statusStyle}>
            {status}
          </span>
          <ContextMenu
            items={contextMenuItems}
            placement="bottom-left"
            trigger={
              <button className={`p-1.5 text-sm rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                ⋯
              </button>
            }
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {inputPorts.length ? (
          <div className="space-y-2">
            {/* Simplified port section header */}
            <p className="text-xs font-medium uppercase tracking-wide theme-text-muted">Inputs</p>
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
            <p className="text-xs font-medium uppercase tracking-wide text-right theme-text-muted">Outputs</p>
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
