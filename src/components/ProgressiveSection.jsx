import { useState } from 'react';
import { useFeatureFlags } from '../context/FeatureFlagContext.jsx';

export default function ProgressiveSection({ title = 'Advanced', children, defaultOpen = false, telemetryId }) {
  const { flags } = useFeatureFlags();
  const [open, setOpen] = useState(defaultOpen);

  if (!flags.progressiveDisclosure) {
    return children;
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/70"
      >
        {title}
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="mt-3 space-y-3 text-sm text-white/80">{children}</div> : null}
    </div>
  );
}
