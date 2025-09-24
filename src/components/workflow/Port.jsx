import { memo, useMemo } from 'react';
import { Handle } from 'reactflow';

const TYPE_META = {
  video: { label: 'Video', icon: '🎥', gradient: 'from-sky-400/80 to-indigo-500/80' },
  text: { label: 'Text', icon: '📝', gradient: 'from-rose-400/80 to-pink-500/80' },
  audio: { label: 'Audio', icon: '🔊', gradient: 'from-emerald-400/80 to-teal-500/80' },
  image: { label: 'Image', icon: '🖼️', gradient: 'from-amber-400/80 to-orange-500/80' },
};

function Port({
  id,
  type,
  kind = 'output',
  onValidate,
  highlighted,
}) {
  const meta = useMemo(() => TYPE_META[type] ?? TYPE_META.text, [type]);
  const isTarget = kind === 'input';

  return (
    <div className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] theme-text-muted ${isTarget ? 'justify-start' : 'justify-end'}`}>
      {isTarget ? (
        <span className="hidden sm:inline">{meta.label}</span>
      ) : null}
      <Handle
        id={id}
        type={isTarget ? 'target' : 'source'}
        position={isTarget ? 'left' : 'right'}
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br ${meta.gradient} text-sm shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-transform duration-200 hover:scale-110 ${highlighted ? 'ring-2 ring-rose-400/70' : ''}`}
        isValidConnection={onValidate}
      >
        <span aria-hidden>{meta.icon}</span>
      </Handle>
      {!isTarget ? (
        <span className="hidden sm:inline">{meta.label}</span>
      ) : null}
    </div>
  );
}

export default memo(Port);
