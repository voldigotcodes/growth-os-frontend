export default function EmptyState({ title, description, actions = null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center">
      <h3 className="text-base font-semibold theme-text-primary">{title}</h3>
      <p className="max-w-md text-sm text-white/65">{description}</p>
      {actions ? <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
