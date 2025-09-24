import { memo, useMemo } from 'react';
import GlassCard from '../GlassCard.jsx';

function WorkflowNodeConfigPanel({ node, onChange }) {
  const schema = node?.data?.configSchema;
  const config = node?.data?.config ?? {};

  const properties = useMemo(() => {
    if (!schema || typeof schema !== 'object') return {};
    return schema.properties ?? {};
  }, [schema]);

  const propertyEntries = useMemo(() => Object.entries(properties), [properties]);

  if (!node) {
    return (
      <GlassCard title="Tool Settings" subtitle="Select a node to adjust inputs" className="glass-static">
        <p className="text-sm theme-text-muted">Pick a tool on the canvas to reveal its controls.</p>
      </GlassCard>
    );
  }

  if (!propertyEntries.length) {
    return (
      <GlassCard title={node?.data?.label ?? 'Tool Settings'} subtitle="This tool has no configurable parameters." className="glass-static">
        <p className="text-sm theme-text-muted">Connect it to the flow and you’re good to go.</p>
      </GlassCard>
    );
  }

  const handleUpdate = (key, value) => {
    onChange?.(node.id, { [key]: value });
  };

  const renderField = (key, definition) => {
    const type = definition?.type ?? 'string';
    const title = definition?.title ?? key;
    const description = definition?.description;
    const currentValue = config[key] ?? definition?.default ?? '';

    if (Array.isArray(definition?.enum)) {
      return (
        <label key={key} className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] theme-text-muted">
          {title}
          <select
            value={currentValue}
            onChange={(event) => handleUpdate(key, event.target.value)}
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60"
          >
            {definition.enum.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {description ? <span className="text-[11px] normal-case text-white/60">{description}</span> : null}
        </label>
      );
    }

    if (type === 'boolean') {
      return (
        <label key={key} className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] theme-text-muted">
          <span>{title}</span>
          <input
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={(event) => handleUpdate(key, event.target.checked)}
            className="h-5 w-9 cursor-pointer rounded-full border border-white/20 bg-white/10 accent-sky-400"
          />
        </label>
      );
    }

    const isLongText = (definition?.format === 'textarea') || (typeof currentValue === 'string' && currentValue.length > 80) || key.toLowerCase().includes('instruction');

    if (type === 'number' || type === 'integer') {
      return (
        <label key={key} className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] theme-text-muted">
          {title}
          <input
            type="number"
            value={currentValue}
            onChange={(event) => handleUpdate(key, event.target.value)}
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
          />
          {description ? <span className="text-[11px] normal-case text-white/60">{description}</span> : null}
        </label>
      );
    }

    if (isLongText) {
      return (
        <label key={key} className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] theme-text-muted">
          {title}
          <textarea
            value={currentValue}
            onChange={(event) => handleUpdate(key, event.target.value)}
            className="min-h-[120px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/60"
            placeholder={definition?.placeholder}
          />
          {description ? <span className="text-[11px] normal-case text-white/60">{description}</span> : null}
        </label>
      );
    }

    return (
      <label key={key} className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] theme-text-muted">
        {title}
        <input
          type="text"
          value={currentValue}
          onChange={(event) => handleUpdate(key, event.target.value)}
          className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
          placeholder={definition?.placeholder}
        />
        {description ? <span className="text-[11px] normal-case text-white/60">{description}</span> : null}
      </label>
    );
  };

  return (
    <GlassCard
      title={node.data?.label ?? 'Tool Settings'}
      subtitle="Adjust node parameters before saving or running."
      className="glass-static"
    >
      <div className="space-y-4 text-sm">
        {propertyEntries.map(([key, definition]) => renderField(key, definition))}
      </div>
    </GlassCard>
  );
}

export default memo(WorkflowNodeConfigPanel);
