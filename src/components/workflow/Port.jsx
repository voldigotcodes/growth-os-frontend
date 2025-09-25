import { memo, useMemo, useState } from 'react';
import { Handle } from 'reactflow';
import { useTheme } from '../../context/ThemeContext.jsx';

// Unified type metadata with consistent gradients
const TYPE_META = {
  video: { label: 'Video', icon: '🎥', gradient: 'from-sky-400/75 to-indigo-500/75' },
  text: { label: 'Text', icon: '📝', gradient: 'from-rose-400/75 to-pink-500/75' },
  audio: { label: 'Audio', icon: '🔊', gradient: 'from-emerald-400/75 to-teal-500/75' },
  image: { label: 'Image', icon: '🖼️', gradient: 'from-amber-400/75 to-orange-500/75' },
  status: { label: 'Status', icon: '📈', gradient: 'from-lime-400/75 to-emerald-500/75' },
};

function Port({ port, onValidate, highlighted, variant = 'default' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hovered, setHovered] = useState(false);
  const direction = port?.direction ?? 'output';
  const dataType = port?.type ?? port?.data_type ?? port?.dataType ?? 'text';
  const meta = useMemo(
    () => TYPE_META[dataType] ?? {
      label: dataType,
      icon: '✨',
      gradient: isDark ? 'from-slate-300/60 to-slate-500/60' : 'from-slate-400/60 to-slate-600/60'
    },
    [dataType, isDark]
  );
  const isTarget = direction === 'input';
  const portId = port?.id;
  const label = port?.label ?? meta.label;

  if (!portId) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {isTarget ? (
          <span className={`text-xs font-medium ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{label}</span>
        ) : null}
        <div className="relative flex items-center justify-center">
          {/* Simplified compact port with consistent sizing and subtle effects */}
          <Handle
            id={portId}
            type={isTarget ? 'target' : 'source'}
            position={isTarget ? 'left' : 'right'}
            className={`flex h-6 w-6 items-center justify-center rounded-full border bg-gradient-to-br ${meta.gradient} text-xs transition-all duration-300 ease-out hover:scale-105 ${
              isDark ? 'border-white/20 shadow-sm' : 'border-slate-300/40 shadow-sm'
            } ${highlighted ? 'ring-2 ring-rose-400/60 shadow-md' : ''}`}
            isValidConnection={onValidate}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <span aria-hidden>{meta.icon}</span>
          </Handle>
          {/* Simplified connection indicator */}
          <span
            aria-hidden
            className={`pointer-events-none absolute top-1/2 h-0.5 w-8 -translate-y-1/2 rounded-full transition-all duration-300 ease-out ${
              isDark ? 'bg-white/30' : 'bg-slate-400/40'
            } ${
              isTarget ? '-left-7 origin-right' : '-right-7 origin-left'
            } ${hovered ? 'scale-100 opacity-80' : 'scale-75 opacity-0'}`}
          />
        </div>
        {!isTarget ? (
          <span className={`text-xs font-medium ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{label}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-xs uppercase tracking-wide theme-text-muted ${
        isTarget ? 'justify-start' : 'justify-end'
      }`}
    >
      {isTarget ? <span className="hidden sm:inline">{label}</span> : null}
      <div className="relative flex items-center justify-center">
        {/* Default port with unified styling */}
        <Handle
          id={portId}
          type={isTarget ? 'target' : 'source'}
          position={isTarget ? 'left' : 'right'}
          className={`flex h-7 w-7 items-center justify-center rounded-full border bg-gradient-to-br ${meta.gradient} text-sm transition-all duration-300 ease-out hover:scale-105 ${
            isDark ? 'border-white/20 shadow-sm' : 'border-slate-300/40 shadow-sm'
          } ${highlighted ? 'ring-2 ring-rose-400/60 shadow-md' : ''}`}
          isValidConnection={onValidate}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span aria-hidden>{meta.icon}</span>
        </Handle>
        {/* Unified connection indicator */}
        <span
          aria-hidden
          className={`pointer-events-none absolute top-1/2 h-0.5 w-10 -translate-y-1/2 rounded-full transition-all duration-300 ease-out ${
            isDark ? 'bg-white/30' : 'bg-slate-400/40'
          } ${
            isTarget ? '-left-9 origin-right' : '-right-9 origin-left'
          } ${hovered ? 'scale-100 opacity-80' : 'scale-75 opacity-0'}`}
        />
      </div>
      {!isTarget ? <span className="hidden sm:inline">{label}</span> : null}
    </div>
  );
}

export default memo(Port);
