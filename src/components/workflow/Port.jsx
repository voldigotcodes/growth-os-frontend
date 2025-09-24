import { memo, useMemo, useState } from 'react';
import { Handle } from 'reactflow';

const TYPE_META = {
  video: { label: 'Video', icon: '🎥', gradient: 'from-sky-400/80 to-indigo-500/80' },
  text: { label: 'Text', icon: '📝', gradient: 'from-rose-400/80 to-pink-500/80' },
  audio: { label: 'Audio', icon: '🔊', gradient: 'from-emerald-400/80 to-teal-500/80' },
  image: { label: 'Image', icon: '🖼️', gradient: 'from-amber-400/80 to-orange-500/80' },
  status: { label: 'Status', icon: '📈', gradient: 'from-lime-400/80 to-emerald-500/80' },
};

function Port({ port, onValidate, highlighted }) {
  const [hovered, setHovered] = useState(false);
  const direction = port?.direction ?? 'output';
  const dataType = port?.type ?? port?.data_type ?? port?.dataType ?? 'text';
  const meta = useMemo(() => TYPE_META[dataType] ?? { label: dataType, icon: '✨', gradient: 'from-slate-200/80 to-slate-400/80' }, [dataType]);
  const isTarget = direction === 'input';
  const portId = port?.id;
  const label = port?.label ?? meta.label;

  if (!portId) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] theme-text-muted ${isTarget ? 'justify-start' : 'justify-end'}`}>
      {isTarget ? <span className="hidden sm:inline">{label}</span> : null}
      <div className="relative flex items-center justify-center">
        <Handle
          id={portId}
          type={isTarget ? 'target' : 'source'}
          position={isTarget ? 'left' : 'right'}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br ${meta.gradient} text-sm shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-transform duration-200 hover:scale-110 ${highlighted ? 'ring-2 ring-rose-400/70' : ''}`}
          isValidConnection={onValidate}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span aria-hidden>{meta.icon}</span>
        </Handle>
        <span
          aria-hidden
          className={`pointer-events-none absolute top-1/2 h-px w-12 -translate-y-1/2 bg-white/40 transition-all duration-200 ease-out ${
            isTarget ? '-left-11 origin-right' : '-right-11 origin-left'
          } ${hovered ? 'scale-100 opacity-80' : 'scale-75 opacity-0'}`}
        />
      </div>
      {!isTarget ? <span className="hidden sm:inline">{label}</span> : null}
    </div>
  );
}

export default memo(Port);
