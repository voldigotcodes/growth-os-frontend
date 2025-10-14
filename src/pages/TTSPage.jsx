import { useEffect, useMemo, useRef, useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import OutputPanel from '../components/OutputPanel.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { API_BASE, fetchVoicePreview, fetchVoices, generateTTS, saveVoiceToWorkspace } from '../lib/apiClient.js';

const DEFAULT_TTS_SCRIPT =
  'Hook: 10-second swipe challenge that stacks proof upfront.\nBenefit: Watch how the serum fades breakouts in 72 hours.\nGuarantee: 30-day refund if your skin doesn’t respond.\nCTA: Tap the link to claim your launch bundle today.';
const TTS_STORAGE_KEY = 'growth-os-tts-state';
const DEFAULT_TTS_STATE = {
  scriptText: DEFAULT_TTS_SCRIPT,
  provider: 'openai',
  voice: 'alloy',
  draftMode: false,
  voiceTitle: 'Voice Canvas',
  voiceTags: 'Voiceover',
  audioUrl: '',
  lastRenderedScript: '',
};

export default function TTSPage() {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const isDark = theme === 'dark';

  const [persistentState, setPersistentState] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_TTS_STATE;
    }
    try {
      const stored = window.sessionStorage.getItem(TTS_STORAGE_KEY);
      if (!stored) {
        return DEFAULT_TTS_STATE;
      }
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_TTS_STATE, ...parsed };
    } catch {
      return DEFAULT_TTS_STATE;
    }
  });

  const updatePersistentState = (updater) => {
    setPersistentState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  };

  const createPersistentSetter = (key) => (valueOrUpdater) => {
    updatePersistentState((prev) => {
      const nextValue = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev[key]) : valueOrUpdater;
      if (prev[key] === nextValue) {
        return prev;
      }
      return { ...prev, [key]: nextValue };
    });
  };

  const {
    scriptText,
    provider,
    voice,
    draftMode,
    voiceTitle,
    voiceTags,
    audioUrl,
    lastRenderedScript,
  } = persistentState;

  const setScriptText = createPersistentSetter('scriptText');
  const setProvider = createPersistentSetter('provider');
  const setVoice = createPersistentSetter('voice');
  const setDraftMode = createPersistentSetter('draftMode');
  const setVoiceTitle = createPersistentSetter('voiceTitle');
  const setVoiceTags = createPersistentSetter('voiceTags');
  const setAudioUrl = createPersistentSetter('audioUrl');
  const setLastRenderedScript = createPersistentSetter('lastRenderedScript');

  const [providers, setProviders] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const DEFAULT_PREVIEW_TEXT = 'A quick brown fox once ran a workflow in Growth OS, it made him 10 times faster.';
  const [autoPreview, setAutoPreview] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('growth-os-voice-autopreview') === 'true';
    } catch {
      return false;
    }
  });
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const previewCacheRef = useRef(new Map());
  const previewAudioRef = useRef(null);
  const hoverPreviewTimeoutRef = useRef(null);
  const previewRequestRef = useRef({ token: null });
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [downloadingTrack, setDownloadingTrack] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(TTS_STORAGE_KEY, JSON.stringify(persistentState));
    } catch {
      // ignore persistence errors
    }
  }, [persistentState]);

  // Use standard theme text classes for proper contrast
  const labelText = 'theme-text-primary';
  const subtleText = 'theme-text-muted';
  const neutralAction = isDark
    ? 'liquid-button text-white/85 hover:text-white'
    : 'liquid-button text-slate-700 hover:text-slate-900';
  const quietAction = isDark
    ? 'liquid-button px-4 py-1 text-xs border-white/15 text-white/70 hover:text-white'
    : 'liquid-button px-4 py-1 text-xs border-slate-200/70 text-slate-600 hover:text-slate-900';
  const accentFuchsia = isDark
    ? 'liquid-button px-4 py-1 text-xs border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-200 hover:ring-fuchsia-300/50 hover:text-fuchsia-100'
    : 'liquid-button px-4 py-1 text-xs border-fuchsia-200/70 bg-fuchsia-100/70 text-fuchsia-600 hover:ring-fuchsia-200/60 hover:text-fuchsia-700';
const accentEmerald = isDark
  ? 'liquid-button border-emerald-400/60 bg-emerald-500/15 text-emerald-200 hover:ring-emerald-300/50'
  : 'liquid-button border-emerald-200/70 bg-emerald-100/80 text-emerald-600 hover:ring-emerald-200/60';
const accentSky = isDark
  ? 'liquid-button border-sky-400/60 bg-sky-500/20 text-sky-100 hover:ring-sky-300/50'
    : 'liquid-button border-sky-300/80 bg-sky-100/80 text-sky-700 hover:ring-sky-300/60';
  const voiceOptionBase = isDark
    ? 'liquid-button px-3 py-2 text-xs border-white/15 text-white/70 hover:text-white'
    : 'liquid-button px-3 py-2 text-xs border-slate-200/70 text-slate-600 hover:text-slate-900';
  const voiceOptionActive = isDark
    ? 'border-sky-400/70 bg-sky-500/25 text-sky-100 ring-1 ring-sky-300/60'
    : 'border-sky-300/80 bg-sky-100/80 text-sky-700 ring-1 ring-sky-300/60';
  const disabledButton = 'opacity-60 cursor-not-allowed';

  const resolvedAudioUrl = audioUrl ? `${API_BASE}${audioUrl}` : '';

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const data = await fetchVoices();
        if (data?.providers?.length) {
          setProviders(data.providers);
          const defaultProvider = data.providers.find((entry) => entry.id === 'openai') || data.providers[0];
          setPersistentState((prev) => {
            let nextProvider = prev.provider;
            if (!data.providers.some((entry) => entry.id === nextProvider)) {
              nextProvider = defaultProvider?.id ?? 'openai';
            }
            const selectedProvider = data.providers.find((entry) => entry.id === nextProvider);
            const availableVoices = selectedProvider?.voices ?? [];
            let nextVoice = prev.voice;
            if (!availableVoices.includes(nextVoice)) {
              nextVoice = availableVoices[0] ?? defaultProvider?.voices?.[0] ?? 'alloy';
            }
            if (!nextVoice) {
              nextVoice = 'alloy';
            }
            if (nextProvider === prev.provider && nextVoice === prev.voice) {
              return prev;
            }
            return { ...prev, provider: nextProvider, voice: nextVoice };
          });
        }
      } catch (error) {
        addToast(error.message || 'Unable to load voice providers.', 'error');
      } finally {
        setLoadingVoices(false);
      }
    };

    loadVoices();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('growth-os-voice-autopreview', String(autoPreview));
    } catch {
      // ignore storage errors
    }
  }, [autoPreview]);

  useEffect(() => {
    return () => {
      if (hoverPreviewTimeoutRef.current) {
        clearTimeout(hoverPreviewTimeoutRef.current);
        hoverPreviewTimeoutRef.current = null;
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      previewRequestRef.current.token = null;
    };
  }, []);

  const currentProvider = useMemo(
    () => providers.find((entry) => entry.id === provider) || { id: 'openai', name: 'ChatGPT Voices', voices: ['alloy'] },
    [providers, provider]
  );

  const availableVoices = currentProvider.voices?.length ? currentProvider.voices : ['alloy'];
  const voiceLabel = useMemo(
    () => voice.replace(/(^|\s|_)(\w)/g, (match, prefix, char) => `${prefix}${char.toUpperCase()}`),
    [voice]
  );
  const voiceMeta = useMemo(() => {
    const defaultMeta = {
      warmth: 'Balanced tone with subtle warmth for trust and authority.',
      cadence: 'Polished delivery tuned for ecommerce voiceovers.',
      energy: 'Confident presence without sounding overly aggressive.',
      tone: 'Neutral, persuasive',
      gender: 'Androgynous',
    };

    const openaiVoiceDescriptions = {
      alloy: {
        warmth: 'Balanced tone with calm confidence.',
        cadence: 'Professional pacing with subtle rhythm.',
        energy: 'Steady energy suitable for trust-building reads.',
        tone: 'Neutral, reassuring',
        gender: 'Androgynous',
      },
      echo: {
        warmth: 'Bright and approachable.',
        cadence: 'Friendly rhythm that feels conversational.',
        energy: 'High energy suited for punchy hooks.',
        tone: 'Upbeat, marketing-forward',
        gender: 'Androgynous',
      },
      fable: {
        warmth: 'Storyteller warmth with emotive flow.',
        cadence: 'Narrative pacing ideal for storytelling.',
        energy: 'Gentle energy that keeps attention.',
        tone: 'Warm, narrative',
        gender: 'Feminine',
      },
      onyx: {
        warmth: 'Deep, authoritative resonance.',
        cadence: 'Deliberate pacing for trust and gravitas.',
        energy: 'Controlled power to sell premium offers.',
        tone: 'Authoritative, bold',
        gender: 'Masculine',
      },
      nova: {
        warmth: 'Fresh, modern tone.',
        cadence: 'Dynamic pacing tailored for social ads.',
        energy: 'Vibrant energy that pops in feeds.',
        tone: 'Bright, trendy',
        gender: 'Feminine',
      },
      shimmer: {
        warmth: 'Sparkling and playful.',
        cadence: 'Quick, rhythmic delivery that hooks fast.',
        energy: 'High-energy for bold offers.',
        tone: 'Playful, energetic',
        gender: 'Feminine',
      },
      coral: {
        warmth: 'Soothing yet confident.',
        cadence: 'Relaxed rhythm with clarity.',
        energy: 'Moderate energy for thoughtful pitches.',
        tone: 'Calm, premium',
        gender: 'Feminine',
      },
      verse: {
        warmth: 'Articulate and expressive.',
        cadence: 'Balanced flow with emphasis on storytelling.',
        energy: 'Medium-high energy ideal for testimonials.',
        tone: 'Expressive, emotive',
        gender: 'Masculine',
      },
      ballad: {
        warmth: 'Rich, cinematic warmth.',
        cadence: 'Measured delivery for dramatic builds.',
        energy: 'Controlled intensity for hero moments.',
        tone: 'Cinematic, bold',
        gender: 'Masculine',
      },
      ash: {
        warmth: 'Minimalist, polished.',
        cadence: 'Sleek pacing perfect for tech or luxury.',
        energy: 'Low-key energy that still persuades.',
        tone: 'Cool, modern',
        gender: 'Androgynous',
      },
      sage: {
        warmth: 'Mentor-like confidence.',
        cadence: 'Steady guidance with clarity.',
        energy: 'Grounded energy for educational content.',
        tone: 'Wise, informative',
        gender: 'Masculine',
      },
      marin: {
        warmth: 'Light and refreshing.',
        cadence: 'Airy pacing great for lifestyle lifts.',
        energy: 'Gentle energy that invites curiosity.',
        tone: 'Light, lifestyle',
        gender: 'Feminine',
      },
      cedar: {
        warmth: 'Earthy and grounded.',
        cadence: 'Measured pace for credibility.',
        energy: 'Strong foundation for authority messaging.',
        tone: 'Grounded, trustworthy',
        gender: 'Masculine',
      },
    };

    if (provider === 'elevenlabs') {
      const displayName = voice || 'Default';
      const friendlyTone = `${displayName} delivers studio-quality realism with expressive dynamics.`;
      const warmLine = `${displayName} carries humanlike warmth ideal for emotive storytelling.`;
      return {
        warmth: warmLine,
        cadence: 'Responsive pacing that mirrors natural human speech patterns.',
        energy: 'Wide dynamic range for persuasive launches or testimonial moments.',
        tone: friendlyTone,
        gender: 'Varies by voice — consult your ElevenLabs dashboard.',
      };
    }

    const lower = voice.toLowerCase();
    return openaiVoiceDescriptions[lower] ?? defaultMeta;
  }, [provider, voice]);

  const normalizedScript = scriptText.trim();
  const isAudioPresent = Boolean(audioUrl);
  const isAudioFresh = isAudioPresent && normalizedScript === lastRenderedScript;
  const primaryActionIsDownload = isAudioFresh;
  const primaryActionBusy = primaryActionIsDownload ? downloadingTrack : isGenerating;
  const primaryActionLabel = primaryActionIsDownload
    ? primaryActionBusy
      ? 'Preparing…'
      : 'Download Voice Track'
    : primaryActionBusy
      ? 'Generating…'
      : 'Generate Audio';
  const primaryActionClass = primaryActionIsDownload ? accentEmerald : accentSky;
  const primaryActionDisabled = primaryActionIsDownload
    ? !isAudioPresent || downloadingTrack
    : !normalizedScript || isGenerating || loadingVoices;

  const previewKey = (providerId, voiceName) => `${providerId}:${voiceName}`;

  const cancelHoverPreview = () => {
    if (hoverPreviewTimeoutRef.current) {
      clearTimeout(hoverPreviewTimeoutRef.current);
      hoverPreviewTimeoutRef.current = null;
    }
  };

  const stopPreviewPlayback = ({ resetState = true } = {}) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      try {
        previewAudioRef.current.src = '';
      } catch {
        // ignore browser-specific src errors
      }
      previewAudioRef.current = null;
    }
    if (resetState) {
      setIsPreviewing(false);
      setPreviewingVoice(null);
    }
    previewRequestRef.current.token = null;
  };

  const playVoicePreview = async (voiceName, providerOverride = provider) => {
    if (!voiceName) return;
    cancelHoverPreview();

    const providerId = providerOverride || provider;
    const requestVoice = providerId === 'openai' ? voiceName.toLowerCase() : voiceName;
    const cacheIdentifier = previewKey(providerId, voiceName);

    stopPreviewPlayback();
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const requestToken = Symbol(`voice-preview:${cacheIdentifier}`);
    previewRequestRef.current.token = requestToken;
    setIsPreviewing(true);
    setPreviewingVoice(cacheIdentifier);

    try {
      let audioPath = previewCacheRef.current.get(cacheIdentifier);

      if (!audioPath) {
        const response = await fetchVoicePreview({
          provider: providerId,
          voice: requestVoice,
          text: DEFAULT_PREVIEW_TEXT,
        });
        audioPath = response?.audio_url;
        if (!audioPath) {
          throw new Error('Preview unavailable for this voice.');
        }
        previewCacheRef.current.set(cacheIdentifier, audioPath);

        if (previewRequestRef.current.token !== requestToken) {
          return;
        }
      }

      if (previewRequestRef.current.token !== requestToken) {
        return;
      }

      const resolvedUrl = audioPath.startsWith('http') ? audioPath : `${API_BASE}${audioPath}`;
      const audioElement = new Audio(resolvedUrl);
      previewAudioRef.current = audioElement;

      const handleEnded = () => {
        if (previewRequestRef.current.token !== requestToken) {
          return;
        }
        previewAudioRef.current = null;
        setIsPreviewing(false);
        setPreviewingVoice(null);
        previewRequestRef.current.token = null;
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.removeEventListener('error', handleError);
      };

      const handleError = () => {
        if (previewRequestRef.current.token !== requestToken) {
          return;
        }
        previewAudioRef.current = null;
        setIsPreviewing(false);
        setPreviewingVoice(null);
        addToast('Unable to play voice preview.', 'error');
        previewRequestRef.current.token = null;
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.removeEventListener('error', handleError);
      };

      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('error', handleError);

      try {
        await audioElement.play();
      } catch (playError) {
        handleError();
      }
    } catch (error) {
      if (previewRequestRef.current.token === requestToken) {
        stopPreviewPlayback();
        addToast(error.message || 'Unable to generate voice preview.', 'error');
      }
    }
  };

  const scheduleHoverPreview = (voiceName, providerOverride = provider) => {
    if (!autoPreview || !voiceName) return;
    cancelHoverPreview();
    hoverPreviewTimeoutRef.current = setTimeout(() => {
      hoverPreviewTimeoutRef.current = null;
      const cacheIdentifier = previewKey(providerOverride, voiceName);
      if (isPreviewing && previewingVoice === cacheIdentifier) {
        return;
      }
      playVoicePreview(voiceName, providerOverride);
    }, 200);
  };

  const handlePreviewClick = () => {
    const cacheIdentifier = previewKey(provider, voice);
    if (isPreviewing && previewingVoice === cacheIdentifier) {
      cancelHoverPreview();
      stopPreviewPlayback();
      return;
    }
    playVoicePreview(voice, provider);
  };

  const handleGenerate = async () => {
    if (!normalizedScript) {
      addToast('Script is empty—add your copy first.', 'error');
      return;
    }
    stopPreviewPlayback();
    setIsGenerating(true);
    setAudioUrl('');
    setLastRenderedScript('');
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    try {
      const voiceParam = provider === 'openai' ? voice.toLowerCase() : voice;
      const { audio_url } = await generateTTS({
        text: scriptText,
        voice: voiceParam,
        draft: draftMode,
        use_elevenlabs: provider === 'elevenlabs',
        title: voiceTitle,
        tags: voiceTags,
      });
      setAudioUrl(audio_url);
      setLastRenderedScript(normalizedScript);
      addToast('Voice track generated.');
    } catch (error) {
      addToast(error.message || 'Could not generate audio.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrimaryAction = () => {
    if (primaryActionIsDownload) {
      handleDownloadTrack();
    } else {
      handleGenerate();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    cancelHoverPreview();
    stopPreviewPlayback();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => addToast('Unable to play audio.', 'error'));
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (event) => {
    const audio = audioRef.current;
    if (!audio || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
    const newTime = percentage * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (value) => {
    if (!value || Number.isNaN(value)) return '0:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleDownloadTrack = async () => {
    if (!audioUrl) return;
    setDownloadingTrack(true);
    try {
      const filename = audioUrl.split('/').pop() || 'voice-render.wav';
      const response = await fetch(resolvedAudioUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      addToast('Unable to download voice track.', 'error');
    } finally {
      setDownloadingTrack(false);
    }
  };

  const handleSaveVoiceToWorkspace = async () => {
    if (!isAudioFresh || !audioUrl) {
      addToast('Generate a fresh voice track before saving.', 'error');
      return;
    }
    setIsSavingWorkspace(true);
    try {
      await saveVoiceToWorkspace({
        fileUrl: audioUrl,
        voice,
        provider,
        title: voiceTitle,
        tags: voiceTags,
      });
      addToast('Voice track saved to Workspace Library.');
    } catch (error) {
      addToast(error.message || 'Unable to save voice track.', 'error');
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold theme-text-primary">AI Voice Studio</h1>
          <p className={['mt-2 max-w-2xl text-sm', subtleText].join(' ')}>
            Generate natural voiceovers tuned for ecommerce pacing. Feed Growth OS your script and pick a voice that matches your brand energy.
          </p>
        </div>
        <button
          type="button"
          className={neutralAction}
          onClick={() => {
            setScriptText('');
            setAudioUrl('');
            setLastRenderedScript('');
          }}
        >
          Clear Script
        </button>
      </header>

      <div className="grid gap-8 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <GlassCard
            title="Script Editor"
            subtitle="Draft your hook, benefit, and guarantee. Mention the product so the delivery stays on-brand."
          >
            <label className={['space-y-3 text-sm', labelText].join(' ')}>
              <span>Script Input</span>
              <textarea
                className={[
                  'min-h-[220px] w-full resize-y rounded-md border px-5 py-4 text-base shadow-inner focus:outline-none focus:ring-2',
                  isDark
                    ? 'border-white/10 bg-slate-900/40 text-white/90 focus:border-white/30 focus:ring-white/20'
                    : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
                ].join(' ')}
                placeholder="Hook: ____\nBenefit: ____\nGuarantee: ____\nCTA: ____"
                value={scriptText}
                onChange={(event) => setScriptText(event.target.value)}
              />
            </label>
            <div className={['flex flex-wrap items-center justify-between gap-4 text-xs', subtleText].join(' ')}>
              <span>Save different angles as separate canvases to split-test.</span>
              <div className="flex gap-3">
                <button type="button" className={quietAction} onClick={() => setDraftMode((prev) => !prev)}>
                  {draftMode ? 'Draft Mode: On' : 'Draft Mode: Off'}
                </button>
                <button
                  type="button"
                  className={accentFuchsia}
                  onClick={() => {
                    navigator.clipboard
                      .writeText(scriptText)
                      .then(() => addToast('Script copied to clipboard.'))
                      .catch(() => addToast('Could not copy script.', 'error'));
                  }}
                >
                  Copy Script
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            title="Voice Preview"
            subtitle="Play back the AI read, tweak pacing, then export when it feels right."
            actions={
              <button
                type="button"
                className={[
                  primaryActionClass,
                  primaryActionDisabled ? disabledButton : '',
                ].join(' ')}
                onClick={handlePrimaryAction}
                disabled={primaryActionDisabled}
              >
                {primaryActionLabel}
              </button>
            }
          >
            <div
              className={[
                'flex items-center gap-4 rounded-md border p-5 transition-colors duration-300',
                isDark
                  ? 'border-white/10 bg-slate-900/40'
                  : 'border-slate-200/70 bg-white/85 shadow-[0_20px_45px_rgba(148,163,184,0.2)]',
              ].join(' ')}
            >
              <button
                type="button"
                className={[
                  'liquid-button h-12 w-12 rounded-md border text-lg px-0',
                  isDark
                    ? 'border-white/15 text-white hover:ring-white/40'
                    : 'border-slate-200/70 text-slate-700 hover:ring-slate-300/60',
                ].join(' ')}
                onClick={() => {
                  if (audioUrl) {
                    togglePlay();
                  } else {
                    handleGenerate();
                  }
                }}
                disabled={isGenerating}
              >
                {isGenerating ? '…' : audioUrl && !isPlaying ? '▶' : '⏸'}
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium theme-text-primary">{voiceLabel} Voice Render</p>
                <div
                  ref={progressRef}
                  className={[
                    'mt-2 h-2 w-full cursor-pointer overflow-hidden rounded-full',
                    'bg-white/10 transition-colors duration-200 hover:bg-white/20',
                  ].join(' ')}
                  onClick={handleProgressClick}
                >
                  <div
                    className={[
                      'h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-pink-300 transition-all duration-200',
                    ].join(' ')}
                    style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs theme-text-muted">
                  <span>{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      Speed
                      <select
                        className={[
                          'rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.3em]',
                          isDark
                            ? 'border-white/10 bg-white/5 text-white/70'
                            : 'border-slate-200/60 bg-white/70 text-slate-600',
                        ].join(' ')}
                        value={playbackRate}
                        onChange={(event) => setPlaybackRate(Number(event.target.value))}
                      >
                        {[1, 1.25, 1.5, 2, 2.5, 3].map((rate) => (
                          <option key={rate} value={rate}>
                            {rate.toFixed(rate % 1 === 0 ? 0 : 2)}x
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <span className={['text-xs', subtleText].join(' ')}>{audioUrl ? 'Ready' : 'Awaiting render'}</span>
            </div>
            {audioUrl && (
              <audio ref={audioRef} src={resolvedAudioUrl} className="hidden">
                <track kind="captions" src="" label="" default={false} />
              </audio>
            )}
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="theme-text-muted">Workspace Title</span>
                <input
                  className={[
                    'rounded-md border px-4 py-3 focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                      : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
                  ].join(' ')}
                  value={voiceTitle}
                  onChange={(event) => setVoiceTitle(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="theme-text-muted">Workspace Tags (comma separated)</span>
                    <input
                      className={[
                        'rounded-md border px-4 py-3 focus:outline-none focus:ring-2',
                        isDark
                          ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                          : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
                      ].join(' ')}
                      value={voiceTags}
                      onChange={(event) => setVoiceTags(event.target.value)}
                    />
                  </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              {!isAudioFresh && audioUrl && (
                <span className="text-xs theme-text-muted">
                  Script changed since last render — regenerate before saving.
                </span>
              )}
              <button
                type="button"
                className={[
                  accentFuchsia,
                  (!isAudioFresh || isSavingWorkspace) ? disabledButton : '',
                ].join(' ')}
                onClick={handleSaveVoiceToWorkspace}
                disabled={!isAudioFresh || isSavingWorkspace}
              >
                {isSavingWorkspace ? 'Saving…' : 'Save to Workspace'}
              </button>
            </div>
          </GlassCard>

          <OutputPanel activeTab="audio" />
        </div>

        <div className="space-y-8">
          <GlassCard title="Voice Controls" subtitle="Select the vibe that matches your offer.">
            {loadingVoices ? (
              <p className="text-sm theme-text-muted">Loading voice providers…</p>
            ) : (
              <>
                <label className={['space-y-3 text-sm', labelText].join(' ')}>
                  <span>Voice Provider</span>
                  <select
                    className={[
                      'w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2',
                      isDark
                        ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                        : 'border-slate-200/70 bg-white/85 text-slate-600 focus:border-sky-300 focus:ring-sky-200',
                    ].join(' ')}
                    value={provider}
                    onChange={(event) => {
                      const nextProviderId = event.target.value;
                      if (nextProviderId === provider) return;
                      cancelHoverPreview();
                      stopPreviewPlayback();
                      setProvider(nextProviderId);
                      const nextProvider = providers.find((entry) => entry.id === nextProviderId);
                      if (nextProvider?.voices?.length) {
                        const nextVoice = nextProvider.voices[0];
                        setVoice(nextVoice);
                        if (autoPreview) {
                          playVoicePreview(nextVoice, nextProviderId);
                        }
                      } else {
                        setVoice('alloy');
                      }
                    }}
                  >
                    {providers.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={['space-y-3 text-sm', labelText].join(' ')}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>Voice Model</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-xs theme-text-muted">
                        <input
                          type="checkbox"
                          checked={autoPreview}
                          onChange={(event) => {
                            const nextValue = event.target.checked;
                            setAutoPreview(nextValue);
                            if (!nextValue) {
                              cancelHoverPreview();
                              stopPreviewPlayback();
                            }
                          }}
                        />
                        Auto preview on hover
                      </label>
                      <button
                        type="button"
                        className={[
                          accentSky,
                          'px-3 py-2 text-xs',
                          isPreviewing && previewingVoice === previewKey(provider, voice) ? 'opacity-80' : '',
                        ].join(' ')}
                        onClick={handlePreviewClick}
                        disabled={!voice || loadingVoices}
                      >
                        {isPreviewing && previewingVoice === previewKey(provider, voice) ? 'Stop Preview' : 'Preview Voice'}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Available voices">
                    {availableVoices.map((option) => {
                      const cacheIdentifier = previewKey(provider, option);
                      const isActive = option === voice;
                      const isVoicePreviewing = isPreviewing && previewingVoice === cacheIdentifier;
                      return (
                        <button
                          key={option}
                          type="button"
                          className={[
                            voiceOptionBase,
                            isActive ? voiceOptionActive : '',
                            isVoicePreviewing ? 'animate-pulse' : '',
                          ].join(' ').trim()}
                          aria-pressed={isActive}
                          aria-label={`Select ${option} voice`}
                          onClick={() => {
                            cancelHoverPreview();
                            stopPreviewPlayback();
                            if (voice !== option) {
                              setVoice(option);
                              if (autoPreview) {
                                playVoicePreview(option, provider);
                              }
                            } else if (autoPreview) {
                              playVoicePreview(option, provider);
                            }
                          }}
                          onMouseEnter={() => scheduleHoverPreview(option, provider)}
                          onMouseLeave={cancelHoverPreview}
                          onFocus={() => scheduleHoverPreview(option, provider)}
                          onBlur={cancelHoverPreview}
                        >
                          <span>{option}</span>
                          {isVoicePreviewing && <span className="ml-2 text-[10px] uppercase tracking-[0.3em]">Previewing</span>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs theme-text-muted">Preview text: “{DEFAULT_PREVIEW_TEXT}”</p>
                </div>
              </>
            )}

            <div className="grid gap-3 text-sm">
              <div className="rounded-md border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-sm font-medium theme-text-primary">Warmth</p>
                <p className="mt-1 text-xs theme-text-muted">{voiceMeta.warmth}</p>
              </div>
              <div className="rounded-md border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-sm font-medium theme-text-primary">Cadence</p>
                <p className="mt-1 text-xs theme-text-muted">{voiceMeta.cadence}</p>
              </div>
              <div className="rounded-md border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-sm font-medium theme-text-primary">Energy</p>
                <p className="mt-1 text-xs theme-text-muted">{voiceMeta.energy}</p>
              </div>
              <div className="rounded-md border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-sm font-medium theme-text-primary">Tone</p>
                <p className="mt-1 text-xs theme-text-muted">{voiceMeta.tone}</p>
              </div>
              <div className="rounded-md border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-sm font-medium theme-text-primary">Voice Character</p>
                <p className="mt-1 text-xs theme-text-muted">{voiceMeta.gender}</p>
              </div>
            </div>

            <button
              type="button"
              className={[accentSky, 'w-full py-3 text-sm font-semibold'].join(' ')}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating…' : 'Generate Audio'}
            </button>
          </GlassCard>

          <GlassCard title="Session Notes">
            <ul className={['space-y-2 text-sm', subtleText].join(' ')}>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-base">✨</span>
                <p>Lead with the problem, not the features. Let the first 3 seconds prove you understand.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-base">🎚️</span>
                <p>Use medium warmth for testimonials, high energy for product drops.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-base">🧊</span>
                <p>Generate two variations, then split-test which voice keeps retention higher.</p>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
