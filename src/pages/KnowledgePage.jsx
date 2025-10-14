import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { fetchKnowledge, updateKnowledge } from '../lib/apiClient.js';

const defaultState = {
  brandName: 'Your Brand™',
  brandPositioning: 'a premium lifestyle brand',
  roleMission: 'take competitor narratives and reframe them into high-performing ads for our brand.',
  brandVoice: ['Confident', 'Exclusive', 'Playful (yet trust-building)'],
  targetAudience: ['Ambitious millennials and Gen Z', 'Creators, professionals, and trendsetters', 'Value aesthetics, performance, and efficiency'],
  offerName: 'Your Brand™ Flagship Offer',
  offerFormat: 'subscription or hero product format',
  proofDrivers: ['Clinically proven ingredient or feature A', 'Award, certification, or data point B', 'Customer stat or social proof C'],
  coreBenefits: ['Primary benefit one', 'Primary benefit two', 'Primary benefit three'],
  signatureExperience: 'Explain how the product fits seamlessly into daily life.',
  trustBuilders: ['Always include a stat, proof point, or social validation.'],
  trustExamples: ['“Loved by 10,000+ customers worldwide.”', '“Featured in leading publications.”', '“Backed by third-party testing.”'],
  angles: ['Pain relief (solve their biggest frustration).', 'Convenience (show how easy adoption is).', 'Proof & credibility (data, awards, ingredients).', 'Lifestyle fit (how it elevates their routine).'],
  forbidden: ['Do not mention competitor brands.', 'Avoid unrealistic promises or miracle claims.', 'Skip emojis or special symbols unless brand guidelines approve.'],
  rewriteSteps: ['Identify the competitor’s pain point and promise.', 'Replace the solution with our flagship offer.', 'Layer proof drivers and brand-specific benefits.', 'Rewrite hooks to stop scrolls and align with voice.', 'Close with a compelling CTA.'],
  ctaExamples: ['“Tap below—your upgrade starts now.”', '“Stop settling. Start elevating with Your Brand™.”'],
  outputUGC: 'Conversational, TikTok/Reels-ready. Short sentences, relatable voice, direct call-outs.',
  outputVoiceover: 'Professional, testimonial-driven copy layering proof, benefits, and credibility.',
  creativityNotes: ['Hooks should be visual or pattern-based to spark curiosity.', 'Use playful metaphors that reinforce the promise.', 'Add urgency or scarcity only when authentic.'],
};

const cloneState = (value) => JSON.parse(JSON.stringify(value));

const KNOWLEDGE_STORAGE_KEY = 'growth-os-knowledge-state';
const DEFAULT_KNOWLEDGE_SESSION = {
  formState: cloneState(defaultState),
  importText: '',
  showImport: false,
};

function cleanBullet(line) {
  return line.replace(/^[-•\t\s]+/, '').trim();
}

function collectBullets(lines, startIdx, endIdx) {
  const items = [];
  for (let i = startIdx; i < lines.length && (endIdx === -1 || i < endIdx); i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('•')) {
      items.push(cleanBullet(trimmed));
    } else if (trimmed.startsWith('-')) {
      items.push(cleanBullet(trimmed));
    } else if (trimmed.startsWith('Examples:')) {
      items.push(trimmed.replace('Examples:', 'Examples:').trim());
    } else if (trimmed.startsWith('Angles') || trimmed.startsWith('Forbidden')) {
      break;
    }
  }
  return items;
}

function collectNumbered(lines, startIdx, endIdx) {
  const items = [];
  for (let i = startIdx; i < lines.length && (endIdx === -1 || i < endIdx); i += 1) {
    const match = lines[i].trim().match(/^\d+\.\s*(.*)/);
    if (match) {
      items.push(match[1].trim());
    }
  }
  return items;
}

function parseKnowledge(text) {
  if (/Brand Overview/i.test(text) || /Offer Name/i.test(text)) {
    return parseTemplateInput(text);
  }
  const state = JSON.parse(JSON.stringify(defaultState));
  const lines = text.split(/\r?\n/);

  const roleIdx = lines.findIndex((line) => line.trim().startsWith('You are'));
  if (roleIdx !== -1) {
    const roleLine = lines[roleIdx].trim();
    const match = roleLine.match(/for\s+(.*?),\s+(.*?)\.\s+Your task is to\s+(.*)/i);
    if (match) {
      state.brandName = match[1].trim();
      state.brandPositioning = match[2].trim();
      state.roleMission = match[3].trim().replace(/\.$/, '') + '.';
    } else {
      state.roleMission = roleLine;
    }
  }

  const idxBrandVoice = lines.findIndex((line) => line.match(/Brand Voice/i));
  const idxTargetAudience = lines.findIndex((line) => line.match(/Target Audience/i));
  if (idxBrandVoice !== -1 && idxTargetAudience !== -1) {
    state.brandVoice = collectBullets(lines, idxBrandVoice + 1, idxTargetAudience);
  }

  const idxMessagePillars = lines.findIndex((line) => line.match(/Message Pillars|Non-Negotiables/i));
  const idxProofBuilders = lines.findIndex((line) => line.match(/Proof Builders|Trust Builders/i));
  if (idxTargetAudience !== -1 && idxMessagePillars !== -1) {
    state.targetAudience = collectBullets(lines, idxTargetAudience + 1, idxMessagePillars);
  }

  if (idxMessagePillars !== -1 && idxProofBuilders !== -1) {
    const list = collectBullets(lines, idxMessagePillars + 1, idxProofBuilders);
    list.forEach((item) => {
      const lower = item.toLowerCase();
      if (lower.startsWith('offer name') || lower.startsWith('product name')) {
        state.offerName = item.split(':').slice(1).join(':').trim();
      } else if (lower.startsWith('offer type') || lower.startsWith('offer format') || lower.startsWith('form')) {
        state.offerFormat = item.split(':').slice(1).join(':').trim();
      } else if (lower.startsWith('key features') || lower.startsWith('clinically proven actives') || lower.startsWith('proof drivers')) {
        state.proofDrivers = item.split(':').slice(1).join(':').split(',').map((part) => part.trim()).filter(Boolean);
      } else if (lower.startsWith('core benefits') || lower.startsWith('benefits')) {
        state.coreBenefits = item.split(':').slice(1).join(':').split(',').map((part) => part.trim()).filter(Boolean);
      } else if (lower.startsWith('signature experience') || lower.startsWith('format advantage')) {
        state.signatureExperience = item.split(':').slice(1).join(':').trim();
      }
    });
  }

  const idxAngles = lines.findIndex((line) => line.match(/Angles to Weave in|Angles to Explore/i));
  if (idxProofBuilders !== -1 && idxAngles !== -1) {
    const trustLines = collectBullets(lines, idxProofBuilders + 1, idxAngles);
    const examplesStart = trustLines.findIndex((entry) => entry.toLowerCase().startsWith('examples'));
    if (examplesStart !== -1) {
      state.trustBuilders = trustLines.slice(0, examplesStart);
      state.trustExamples = trustLines.slice(examplesStart + 1).filter(Boolean);
    } else {
      state.trustBuilders = trustLines;
    }
  }

  const idxForbidden = lines.findIndex((line) => line.match(/Forbidden|Guardrails/i));
  if (idxAngles !== -1 && idxForbidden !== -1) {
    state.angles = collectBullets(lines, idxAngles + 1, idxForbidden);
  }

  const idxRewrite = lines.findIndex((line) => line.includes('Rewrite Instructions'));
  const idxOutput = lines.findIndex((line) => line.includes('Output Formats'));
  if (idxForbidden !== -1 && idxRewrite !== -1) {
    state.forbidden = collectBullets(lines, idxForbidden + 1, idxRewrite);
  }
  if (idxRewrite !== -1 && idxOutput !== -1) {
    state.rewriteSteps = collectNumbered(lines, idxRewrite + 1, idxOutput);
    const examplesIdx = lines.findIndex((line, index) => index > idxRewrite && line.includes('Examples:'));
    if (examplesIdx !== -1 && examplesIdx < idxOutput) {
      state.ctaExamples = collectBullets(lines, examplesIdx + 1, idxOutput);
    }
  }

  const idxCreativity = lines.findIndex((line) => line.includes('Creativity Parameters'));
  if (idxOutput !== -1 && idxCreativity !== -1) {
    const formatLines = collectBullets(lines, idxOutput + 1, idxCreativity);
    const ugcLine = formatLines.find((line) => line.toLowerCase().includes('ugc-style'));
    const voiceLine = formatLines.find((line) => line.toLowerCase().includes('voiceover'));
    if (ugcLine) {
      state.outputUGC = ugcLine.split(':').slice(1).join(':').trim();
    }
    if (voiceLine) {
      state.outputVoiceover = voiceLine.split(':').slice(1).join(':').trim();
    }
  }

  if (idxCreativity !== -1) {
    state.creativityNotes = collectBullets(lines, idxCreativity + 1, lines.length);
  }

  return state;
}

function parseTemplateInput(text) {
  const state = JSON.parse(JSON.stringify(defaultState));
  const lines = text.split(/\r?\n/).map((line) => line.trim());

  const stringHeadings = [
    { key: 'brandName', pattern: /^brand name/i },
    { key: 'brandPositioning', pattern: /^brand positioning/i },
    { key: 'roleMission', pattern: /^role mission/i },
    { key: 'offerName', pattern: /^offer name/i },
    { key: 'offerFormat', pattern: /^offer format|^offer type/i },
    { key: 'signatureExperience', pattern: /^signature experience/i },
    { key: 'outputUGC', pattern: /^ugc[-\s]style script/i },
    { key: 'outputVoiceover', pattern: /^voiceover script/i },
  ];

  const listKeys = [
    { key: 'brandVoice', pattern: /^brand voice/i },
    { key: 'targetAudience', pattern: /^target audience/i },
    { key: 'proofDrivers', pattern: /^key features|^proof drivers|^clinically proven/i },
    { key: 'coreBenefits', pattern: /^core benefits|^benefits/i },
    { key: 'trustBuilders', pattern: /^proof builders|^trust builders/i },
    { key: 'trustExamples', pattern: /^proof examples|^proof stats|^examples/i },
    { key: 'angles', pattern: /^angles to/i },
    { key: 'forbidden', pattern: /^guardrails|^forbidden/i },
    { key: 'rewriteSteps', pattern: /^rewrite steps/i },
    { key: 'ctaExamples', pattern: /^cta examples/i },
    { key: 'creativityNotes', pattern: /^creativity parameters/i },
  ];

  const listKeySet = new Set(listKeys.map((item) => item.key));
  listKeySet.forEach((key) => {
    state[key] = [];
  });

  let currentListKey = null;

  const pushToCurrent = (line) => {
    if (!currentListKey) return;
    let cleaned = line.replace(/^[-•\d.\s]+/, '').trim();
    if (!cleaned || /^_+$/.test(cleaned)) return;
    state[currentListKey].push(cleaned);
  };

  for (const rawLine of lines) {
    if (!rawLine) {
      currentListKey = null;
      continue;
    }
    const lower = rawLine.toLowerCase();

    let matchedHeading = false;
    for (const heading of stringHeadings) {
      if (heading.pattern.test(lower)) {
        const value = rawLine.split(':').slice(1).join(':').trim();
        if (value && !/^_+$/.test(value)) {
          state[heading.key] = value;
        }
        currentListKey = null;
        matchedHeading = true;
        break;
      }
    }
    if (matchedHeading) continue;

    for (const heading of listKeys) {
      if (heading.pattern.test(lower)) {
        const immediate = rawLine.includes(':') ? rawLine.split(':').slice(1).join(':').trim() : '';
        if (immediate && !/^_+$/.test(immediate)) {
          state[heading.key].push(immediate);
        }
        currentListKey = heading.key;
        matchedHeading = true;
        break;
      }
    }
    if (matchedHeading) continue;

    pushToCurrent(rawLine);
  }

  if (!state.roleMission.endsWith('.')) {
    state.roleMission = `${state.roleMission}.`;
  }

  return state;
}

function buildKnowledge(state) {
  const proofList = state.proofDrivers.join(', ');
  const benefitsList = state.coreBenefits.join(', ');
  const roleLine = `You are a Direct Response Copywriter + Brand Strategist for ${state.brandName}, ${state.brandPositioning}. Your task is to ${state.roleMission}`.replace(/\.\./g, '.');

  return [
    'Role:',
    roleLine.endsWith('.') ? roleLine : `${roleLine}.`,
    '',
    '⸻',
    '',
    'Key Rules',
    '\t1.\tBrand Voice:',
    ...state.brandVoice.map((item) => `\t•\t${item}`),
    '\t2.\tTarget Audience:',
    ...state.targetAudience.map((item) => `\t•\t${item}`),
    '\t3.\tMessage Pillars (Must Always Appear):',
    `\t•\tOffer name: ${state.offerName}`,
    `\t•\tOffer format: ${state.offerFormat}`,
    `\t•\tKey features / proof drivers: ${proofList}`,
    `\t•\tCore benefits: ${benefitsList}`,
    `\t•\tSignature experience: ${state.signatureExperience}`,
    '\t4.\tProof Builders:',
    ...state.trustBuilders.map((item) => `\t•\t${item}`),
    '\t•\tExamples:',
    ...state.trustExamples.map((item) => `\t•\t${item}`),
    '\t5.\tAngles to Explore (choose based on script context):',
    ...state.angles.map((item) => `\t•\t${item}`),
    '\t6.\tGuardrails (Forbidden):',
    ...state.forbidden.map((item) => `\t•\t${item}`),
    '',
    '⸻',
    '',
    'Rewrite Instructions',
    ...state.rewriteSteps.map((item, index) => `\t${index + 1}.\t${item}`),
    '',
    '\t•\tExamples:',
    ...state.ctaExamples.map((item) => `\t•\t${item}`),
    '',
    '⸻',
    '',
    ' Output Formats',
    `\t•\tUGC-style Script (21–35 audience):`,
    `\t${state.outputUGC}`,
    `\t•\tAI Voiceover Script (trust-heavy):`,
    `\t${state.outputVoiceover}`,
    '',
    '⸻',
    '',
    'Creativity Parameters',
    ...state.creativityNotes.map((item) => `\t•\t${item}`),
  ].join('\n');
}

function buildTemplatePrompt() {
  return [
    'PROMPT TEMPLATE — COPY/PASTE INTO CHATGPT',
    '',
    'Provide the brand knowledge using the structure below. Fill each placeholder with concise, actionable information.',
    '',
    'Brand Overview',
    'Brand Name: ____________________________',
    'Brand Positioning (what category / promise): ____________________________',
    'Role Mission (what the copywriter should accomplish): ____________________________',
    '',
    'Brand Voice (list 3-5 adjectives, one per line):',
    '- ____________________________',
    '- ____________________________',
    '- ____________________________',
    '',
    'Target Audience (3 bullets covering who they are, lifestyle, values):',
    '- ____________________________',
    '- ____________________________',
    '- ____________________________',
    '',
    'Offer Details',
    'Offer Name: ____________________________',
    'Offer Format / Type: ____________________________',
    'Key Features / Proof Drivers (one per line):',
    '- ____________________________',
    '- ____________________________',
    '- ____________________________',
    'Core Benefits (one per line):',
    '- ____________________________',
    '- ____________________________',
    '- ____________________________',
    'Signature Experience (how it fits into daily life): ____________________________',
    '',
    'Proof & Angles',
    'Proof Builders (what creates trust):',
    '- ____________________________',
    '- ____________________________',
    'Proof Examples / Stats:',
    '- ____________________________',
    '- ____________________________',
    'Angles to Explore:',
    '- ____________________________',
    '- ____________________________',
    'Guardrails (forbidden claims / tone):',
    '- ____________________________',
    '- ____________________________',
    '',
    'Rewrite Workflow',
    'Rewrite Steps (numbered list):',
    '1. ____________________________',
    '2. ____________________________',
    '3. ____________________________',
    'CTA Examples:',
    '- ____________________________',
    '- ____________________________',
    '',
    'Output Formats & Creativity',
    'UGC Script Notes: ____________________________',
    'Voiceover Script Notes: ____________________________',
    'Creativity Parameters (one per line):',
    '- ____________________________',
    '- ____________________________',
    '',
    'Return the completed template as plain text so it can be pasted back into Growth OS.',
  ].join('\n');
}

export default function KnowledgePage() {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const isDark = theme === 'dark';

  const [sessionState, setSessionState] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_KNOWLEDGE_SESSION;
    }
    try {
      const stored = window.sessionStorage.getItem(KNOWLEDGE_STORAGE_KEY);
      if (!stored) {
        return DEFAULT_KNOWLEDGE_SESSION;
      }
      const parsed = JSON.parse(stored);
      return {
        formState: cloneState(parsed.formState ?? defaultState),
        importText: parsed.importText ?? '',
        showImport: Boolean(parsed.showImport),
      };
    } catch {
      return DEFAULT_KNOWLEDGE_SESSION;
    }
  });

  const updateSessionState = (updater) => {
    setSessionState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  };

  const createSessionSetter = (key) => (valueOrUpdater) => {
    updateSessionState((prev) => {
      const currentValue = prev[key];
      const nextValue =
        typeof valueOrUpdater === 'function' ? valueOrUpdater(currentValue) : valueOrUpdater;
      if (key === 'formState') {
        const serializedCurrent = JSON.stringify(currentValue);
        const serializedNext = JSON.stringify(nextValue);
        if (serializedCurrent === serializedNext) {
          return prev;
        }
        return { ...prev, [key]: cloneState(nextValue) };
      }
      if (currentValue === nextValue) {
        return prev;
      }
      return { ...prev, [key]: nextValue };
    });
  };

  const formState = sessionState.formState;
  const importText = sessionState.importText;
  const showImport = sessionState.showImport;

  const setFormState = createSessionSetter('formState');
  const setImportText = createSessionSetter('importText');
  const setShowImport = createSessionSetter('showImport');

  const [initialState, setInitialState] = useState(cloneState(formState));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchKnowledge();
        const parsed = data?.content ? parseKnowledge(data.content) : defaultState;
        const cloned = cloneState(parsed);
        setFormState(cloned);
        setInitialState(cloneState(cloned));
      } catch (error) {
        addToast(error.message || 'Unable to load knowledge base.', 'error');
        setFormState(cloneState(defaultState));
        setInitialState(cloneState(defaultState));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        KNOWLEDGE_STORAGE_KEY,
        JSON.stringify({
          formState,
          importText,
          showImport,
        })
      );
    } catch {
      // ignore persistence errors
    }
  }, [formState, importText, showImport]);

  const hasChanges = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(initialState),
    [formState, initialState]
  );

  const handleListChange = (key) => (value) => {
    const next = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    setFormState((prev) => ({ ...prev, [key]: next }));
  };

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setSaving(true);
    try {
      await updateKnowledge(buildKnowledge(formState));
      setInitialState(cloneState(formState));
      addToast('General knowledge saved.');
    } catch (error) {
      addToast(error.message || 'Failed to save knowledge.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormState(cloneState(initialState));
    addToast('Changes reverted.');
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(buildTemplatePrompt());
      addToast('Template copied to clipboard.');
    } catch (error) {
      addToast('Unable to copy template.', 'error');
    }
  };

  const handleApplyImport = () => {
    if (!importText.trim()) {
      addToast('Paste template text before importing.', 'error');
      return;
    }
    try {
      const parsed = parseKnowledge(importText);
      setFormState(cloneState(parsed));
      setShowImport(false);
      setImportText('');
      addToast('Template applied. Review and save your changes.');
    } catch (error) {
      addToast('Could not parse the pasted template. Ensure the format matches the prompt.', 'error');
    }
  };

  // Use standard theme text classes for proper contrast
  const subtleText = 'theme-text-muted';

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <GlassCard title="Loading" subtitle="Fetching knowledge base...">
          <p className="text-sm theme-text-muted">Please wait.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold theme-text-primary">General Knowledge</h1>
        <p className={['max-w-3xl text-sm', subtleText].join(' ')}>
          Update the global context that Growth OS uses for every prompt. Adjust brand voice, audience, proof points,
          and creativity cues without touching the raw file.
        </p>
      </header>

      <div className="flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          className={[
            'liquid-button px-6 py-3 text-sm font-semibold',
            !hasChanges || saving ? 'opacity-60 cursor-not-allowed' : '',
          ].join(' ')}
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" className="liquid-button px-6 py-3 text-sm" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="liquid-button px-6 py-3 text-sm" onClick={handleCopyTemplate}>
          Copy Prompt Template
        </button>
        <button
          type="button"
          className="liquid-button px-6 py-3 text-sm"
          onClick={() => setShowImport((prev) => !prev)}
        >
          {showImport ? 'Close Import' : 'Import From Template'}
        </button>
      </div>

      {showImport && (
        <GlassCard
          title="Import General Knowledge"
          subtitle="Paste the filled template from ChatGPT to auto-populate all fields."
        >
          <textarea
            className={[
              'min-h-[260px] w-full resize-y rounded-md border px-5 py-4 text-sm shadow-inner focus:outline-none focus:ring-2 transition',
              isDark
                ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
            ].join(' ')}
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder="Paste the template response here..."
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="liquid-button px-5 py-3 text-sm" onClick={handleApplyImport}>
              Apply Import
            </button>
            <button
              type="button"
              className="liquid-button px-5 py-3 text-sm"
              onClick={() => {
                setImportText('');
                setShowImport(false);
              }}
            >
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      <GlassCard
        title="Brand Overview"
        subtitle="Set the essentials for how Growth OS references your brand."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Brand Name</span>
            <input
              className={[
                'rounded-md border px-4 py-3 focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.brandName}
              onChange={(event) => setFormState((prev) => ({ ...prev, brandName: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Brand Positioning</span>
            <input
              className={[
                'rounded-md border px-4 py-3 focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.brandPositioning}
              onChange={(event) => setFormState((prev) => ({ ...prev, brandPositioning: event.target.value }))}
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          <span className="theme-text-muted">Role Mission</span>
          <textarea
            className={[
              'min-h-[90px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
              isDark
                ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
            ].join(' ')}
            value={formState.roleMission}
            onChange={(event) => setFormState((prev) => ({ ...prev, roleMission: event.target.value }))}
          />
        </label>
      </GlassCard>

      <GlassCard title="Voice & Audience" subtitle="Guide tone and who we’re speaking to.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Brand Voice (one per line)</span>
            <textarea
              className={[
                'min-h-[140px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.brandVoice.join('\n')}
              onChange={(event) => handleListChange('brandVoice')(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Target Audience (one per line)</span>
            <textarea
              className={[
                'min-h-[140px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.targetAudience.join('\n')}
              onChange={(event) => handleListChange('targetAudience')(event.target.value)}
            />
          </label>
        </div>
      </GlassCard>

      <GlassCard title="Offer Fundamentals" subtitle="Details that must appear in every script.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Offer Name</span>
            <input
              className={[
                'rounded-md border px-4 py-3 focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.offerName}
              onChange={(event) => setFormState((prev) => ({ ...prev, offerName: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Offer Format / Type</span>
            <input
              className={[
                'rounded-md border px-4 py-3 focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.offerFormat}
              onChange={(event) => setFormState((prev) => ({ ...prev, offerFormat: event.target.value }))}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Key Features / Proof Drivers (one per line)</span>
            <textarea
              className={[
                'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.proofDrivers.join('\n')}
              onChange={(event) => handleListChange('proofDrivers')(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Core Benefits (one per line)</span>
            <textarea
              className={[
                'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.coreBenefits.join('\n')}
              onChange={(event) => handleListChange('coreBenefits')(event.target.value)}
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          <span className="theme-text-muted">Signature Experience</span>
          <input
            className={[
              'rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2',
              isDark
                ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
            ].join(' ')}
            value={formState.signatureExperience}
            onChange={(event) => setFormState((prev) => ({ ...prev, signatureExperience: event.target.value }))}
          />
        </label>
      </GlassCard>

      <GlassCard title="Proof & Angles" subtitle="Define trust builders, proof, and storytelling levers.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Trust Builders (one per line)</span>
            <textarea
              className={[
                'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.trustBuilders.join('\n')}
              onChange={(event) => handleListChange('trustBuilders')(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">Trust Proof Examples (one per line)</span>
            <textarea
              className={[
                'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.trustExamples.join('\n')}
              onChange={(event) => handleListChange('trustExamples')(event.target.value)}
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          <span className="theme-text-muted">Angles to Weave In (one per line)</span>
          <textarea
            className={[
              'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
              isDark
                ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
            ].join(' ')}
            value={formState.angles.join('\n')}
            onChange={(event) => handleListChange('angles')(event.target.value)}
          />
        </label>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          <span className="theme-text-muted">Forbidden (one per line)</span>
          <textarea
            className={[
              'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
              isDark
                ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
            ].join(' ')}
            value={formState.forbidden.join('\n')}
            onChange={(event) => handleListChange('forbidden')(event.target.value)}
          />
        </label>
      </GlassCard>

      <GlassCard title="Rewrite Workflow" subtitle="Spell out the step-by-step rewrite process.">
        <label className="flex flex-col gap-2 text-sm">
          <span className="theme-text-muted">Rewrite Steps (one per line)</span>
          <textarea
            className={[
              'min-h-[140px] rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2',
              isDark
                ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
            ].join(' ')}
            value={formState.rewriteSteps.join('\n')}
            onChange={(event) => handleListChange('rewriteSteps')(event.target.value)}
          />
        </label>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          <span className="theme-text-muted">CTA Examples (one per line)</span>
          <textarea
            className={[
              'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
              isDark
                ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
            ].join(' ')}
            value={formState.ctaExamples.join('\n')}
            onChange={(event) => handleListChange('ctaExamples')(event.target.value)}
          />
        </label>
      </GlassCard>

      <GlassCard title="Output Formats & Creativity" subtitle="Define final deliverables and creative guardrails.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">UGC-style Script Notes</span>
            <textarea
              className={[
                'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.outputUGC}
              onChange={(event) => setFormState((prev) => ({ ...prev, outputUGC: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="theme-text-muted">AI Voiceover Script Notes</span>
            <textarea
              className={[
                'min-h-[120px] rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                isDark
                  ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                  : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
              ].join(' ')}
              value={formState.outputVoiceover}
              onChange={(event) => setFormState((prev) => ({ ...prev, outputVoiceover: event.target.value }))}
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          <span className="theme-text-muted">Creativity Parameters (one per line)</span>
          <textarea
            className={[
              'min-h-[140px] rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2',
              isDark
                ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
            ].join(' ')}
            value={formState.creativityNotes.join('\n')}
            onChange={(event) => handleListChange('creativityNotes')(event.target.value)}
          />
        </label>
      </GlassCard>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={[
            'liquid-button px-6 py-3 text-sm font-semibold',
            !hasChanges || saving ? 'opacity-60 cursor-not-allowed' : '',
          ].join(' ')}
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" className="liquid-button px-6 py-3 text-sm" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}
