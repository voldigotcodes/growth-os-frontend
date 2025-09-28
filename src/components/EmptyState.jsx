import { useDynamicTextColor } from '../hooks/useDynamicTextColor.js';

export default function EmptyState({ title, description, actions = null }) {
  const { primaryText, mutedText } = useDynamicTextColor();

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-white/10 bg-white/5 px-6 py-10 text-center">
      <h3 className={`text-base font-semibold ${primaryText}`}>{title}</h3>
      <p className={`max-w-md text-sm ${mutedText}`}>{description}</p>
      {actions ? <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
