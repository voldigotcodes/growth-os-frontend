import { useRef, useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import OutputPanel from '../components/OutputPanel.jsx';
import FileUpload from '../components/FileUpload.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { modifyTranscript, saveWorkspaceScript, transcribeFile } from '../lib/apiClient.js';

export default function TranscribePage() {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const isDark = theme === 'dark';

  const hiddenInputRef = useRef(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [instruction, setInstruction] = useState('Rewrite for TikTok hook with urgency and social proof.');
  const [modifiedText, setModifiedText] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [scriptTitle, setScriptTitle] = useState('');
  const [isSavingScript, setIsSavingScript] = useState(false);

  const subtleText = isDark ? 'text-white/60' : 'text-slate-500';
  const secondaryButton = isDark
    ? 'liquid-button px-4 py-2 text-xs font-medium border-white/15 text-white/70 hover:text-white'
    : 'liquid-button px-4 py-2 text-xs font-medium border-slate-200/70 text-slate-600 hover:text-slate-900';
  const accentSky = isDark
    ? 'liquid-button px-4 py-2 text-xs font-semibold border-sky-400/60 bg-sky-500/20 text-sky-100 hover:ring-sky-300/55'
    : 'liquid-button px-4 py-2 text-xs font-semibold border-sky-300/80 bg-sky-100/80 text-sky-700 hover:ring-sky-300/60';
  const accentEmerald = isDark
    ? 'liquid-button px-4 py-2 text-xs font-semibold border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:ring-emerald-300/55'
    : 'liquid-button px-4 py-2 text-xs font-semibold border-emerald-200/70 bg-emerald-100/80 text-emerald-700 hover:ring-emerald-200/60';
  const iconTile = isDark
    ? 'flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-base'
    : 'flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-base text-slate-600';

  const handleFile = async (file) => {
    setIsTranscribing(true);
    setModifiedText('');
    try {
      const { transcript: result } = await transcribeFile(file);
      setTranscript(result);
      addToast('Transcript ready to refine.');
    } catch (error) {
      addToast(error.message || 'Transcription failed.', 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleModify = async () => {
    if (!transcript.trim()) {
      addToast('Upload audio or video to generate a transcript first.', 'error');
      return;
    }
    setIsModifying(true);
    try {
      const { modified_text } = await modifyTranscript({
        transcript,
        instruction,
        version: 'txt',
      });
      setModifiedText(modified_text);
      setScriptTitle((prev) => prev || 'Polished Script');
      addToast('Script polished and ready to record.');
    } catch (error) {
      addToast(error.message || 'Unable to polish the script.', 'error');
    } finally {
      setIsModifying(false);
    }
  };

  const handleSaveScript = async () => {
    if (!modifiedText.trim()) {
      addToast('Polish a script before saving it to the workspace.', 'error');
      return;
    }
    setIsSavingScript(true);
    try {
      await saveWorkspaceScript({
        script: modifiedText,
        title: scriptTitle,
      });
      addToast('Script stored in Workspace Library.');
    } catch (error) {
      addToast(error.message || 'Unable to save script to workspace.', 'error');
    } finally {
      setIsSavingScript(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold theme-text-primary">Script Refinery</h1>
          <p className={['mt-2 max-w-2xl text-sm', subtleText].join(' ')}>
            Drop a call, customer review, or UGC clip. Growth OS will surface the angles, clean the
            transcript, and prepare it for your ad workflow.
          </p>
        </div>
        <button
          type="button"
          className={['liquid-button text-xs', isTranscribing ? 'opacity-60' : ''].join(' ')}
          onClick={() => hiddenInputRef.current?.click()}
          disabled={isTranscribing}
        >
          {isTranscribing ? 'Processing…' : 'Upload Source Media'}
        </button>
      </header>

      <div className="grid gap-8 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <GlassCard
            title="Drop Your Source Material"
            subtitle="We&apos;ll transcribe it, detect speakers, and highlight quotable moments."
          >
            <FileUpload
              label="Upload audio or video"
              hint="Drag in WAV, MP3, MP4, or WebM."
              accept="audio/*,video/*"
              disabled={isTranscribing}
              onFileSelected={handleFile}
            />
            <input
              ref={hiddenInputRef}
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
                event.target.value = '';
              }}
            />
            {isTranscribing && (
              <p className="mt-4 text-xs theme-text-muted">Processing… hang tight while we transcribe.</p>
            )}
          </GlassCard>

          <GlassCard
            title="Transcript Preview"
            subtitle="Skim the smart highlights, then instruct Growth OS on the angle you need."
            actions={
              <div className="flex gap-3">
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => {
                    navigator.clipboard
                      .writeText(transcript)
                      .then(() => addToast('Transcript copied to clipboard.'))
                      .catch(() => addToast('Could not copy transcript.', 'error'));
                  }}
                  disabled={!transcript}
                >
                  Copy Transcript
                </button>
                <button
                  type="button"
                  className={accentSky}
                  onClick={handleModify}
                  disabled={!transcript || isModifying}
                >
                  {isModifying ? 'Polishing…' : 'Polish Script'}
                </button>
              </div>
            }
          >
            <div className={['space-y-6 text-sm leading-relaxed', subtleText].join(' ')}>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] theme-text-muted">Transcript</span>
                <textarea
                  className={[
                    'min-h-[180px] w-full resize-y rounded-2xl border px-4 py-3 text-sm shadow-inner focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                      : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
                  ].join(' ')}
                  placeholder="Upload media to see the transcript here."
                  value={transcript}
                  readOnly
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] theme-text-muted">Refinement instruction</span>
                <textarea
                  className={[
                    'min-h-[120px] w-full resize-y rounded-2xl border px-4 py-3 text-sm shadow-inner focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                      : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
                  ].join(' ')}
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                />
              </label>
              {modifiedText && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] theme-text-muted">Polished Script</p>
                    <p className="mt-2 whitespace-pre-line theme-text-secondary">{modifiedText}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex w-full flex-col gap-2 text-xs sm:max-w-sm">
                      <span className="uppercase tracking-[0.3em] theme-text-muted">Workspace title</span>
                      <input
                        type="text"
                        className={[
                          'w-full rounded-2xl border px-4 py-3 text-sm shadow-inner focus:outline-none focus:ring-2',
                          isDark
                            ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                            : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
                        ].join(' ')}
                        placeholder="Polished Script"
                        value={scriptTitle}
                        onChange={(event) => setScriptTitle(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className={accentEmerald}
                      onClick={handleSaveScript}
                      disabled={isSavingScript}
                    >
                      {isSavingScript ? 'Saving…' : 'Save to Workspace'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <OutputPanel activeTab="transcript" />

          <GlassCard
            title="Processing Timeline"
            subtitle="See where your media is in the pipeline."
          >
            <ul className={['space-y-3 text-sm', subtleText].join(' ')}>
              <li className="flex items-center gap-3">
                <span className={iconTile}>⏱️</span>
                <div>
                  <p className="font-medium theme-text-secondary">Queued</p>
                  <p className={['text-xs', subtleText].join(' ')}>Average wait: 22 seconds</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className={iconTile}>🧠</span>
                <div>
                  <p className="font-medium theme-text-secondary">Transcribing with Whisper Nova</p>
                  <p className={['text-xs', subtleText].join(' ')}>Optimized for accents & hybrid languages</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className={iconTile}>✅</span>
                <div>
                  <p className="font-medium theme-text-secondary">Export Ready</p>
                  <p className={['text-xs', subtleText].join(' ')}>Deliverable: Script + captions bundle</p>
                </div>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
