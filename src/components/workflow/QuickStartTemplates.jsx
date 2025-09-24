import { memo } from 'react';

function QuickStartTemplates({ templates = [], onUse, loadingId }) {
  if (!templates.length) {
    return (
      <div className="glass-panel p-6 text-sm theme-text-muted">
        No templates available yet. Upgrade your plan or check back soon.
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold theme-text-primary">Quick Start Templates</h2>
          <p className="text-xs theme-text-muted">Drop-in automations tailored for Growth teams.</p>
        </div>
      </header>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {templates.map((template) => {
          const loading = loadingId === template.id;
          return (
          <button
            key={template.id}
            type="button"
            onClick={() => onUse?.(template)}
            disabled={loading}
            className={`snap-start min-w-[240px] rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-left shadow-[0_18px_45px_rgba(15,23,42,0.28)] transition hover:scale-[1.02] hover:border-white/25 hover:shadow-[0_26px_65px_rgba(59,130,246,0.25)] ${
              loading ? 'cursor-wait opacity-60 hover:scale-100 hover:border-white/10' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold theme-text-primary">{template.name}</p>
              <span className="text-lg" aria-hidden>{template.icon ?? '✨'}</span>
            </div>
            <p className="mt-2 text-xs theme-text-muted">{template.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] theme-text-muted">
              {template.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 px-2 py-[2px]">
                  {tag}
                </span>
              ))}
              {template.estimated_time ? (
                <span className="rounded-full border border-white/15 px-2 py-[2px]">
                  {template.estimated_time}
                </span>
              ) : null}
              {template.estimated_credits ? (
                <span className="rounded-full border border-sky-300/50 px-2 py-[2px] text-sky-100">
                  {template.estimated_credits} credits
                </span>
              ) : null}
              {template.is_premium ? (
                <span className="rounded-full border border-amber-300/60 px-2 py-[2px] text-amber-200">
                  Premium
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-white/70">
              {loading ? 'Loading…' : 'Use template'}
            </p>
          </button>
        );
        })}
      </div>
    </div>
  );
}

export default memo(QuickStartTemplates);
