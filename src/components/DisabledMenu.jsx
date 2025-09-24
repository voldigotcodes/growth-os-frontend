export default function DisabledMenu({ icon, name, description }) {
  return (
    <div
      className="liquid-interactive flex cursor-not-allowed flex-col gap-1 px-4 py-3 text-sm opacity-50"
      title={`${name} — Coming soon. ${description}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="font-medium">{name}</span>
      </div>
      <p className="text-xs theme-text-muted">{description}</p>
    </div>
  );
}
