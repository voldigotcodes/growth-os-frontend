import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import OutputPanel from '../components/OutputPanel.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import {
  API_BASE,
  downloadMedia,
  fetchDownloadHistory,
  fetchSavedDownloads,
  clearDownloadHistory,
  deleteSavedDownload,
  saveDownloadEntry,
} from '../lib/apiClient.js';

const getDisplayName = (item) => {
  if (!item) return '';
  return item.title || item.url || (item.file_url && item.file_url.split('/').pop()) || 'Saved clip';
};

export default function DownloadPage() {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const isDark = theme === 'dark';

  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [lastTitle, setLastTitle] = useState('');
  const [tags, setTags] = useState('');
  const [savedItems, setSavedItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [saveToWorkspace, setSaveToWorkspace] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Use standard theme text classes for proper contrast
  const subtleText = 'theme-text-muted';
  const outlineButton = isDark
    ? 'liquid-button text-white/85 hover:text-white'
    : 'liquid-button text-slate-700 hover:text-slate-900';
  const accentIndigo = isDark
    ? 'liquid-button px-5 py-3 text-sm font-semibold border-indigo-400/60 bg-indigo-500/20 text-indigo-100 hover:ring-indigo-300/55'
    : 'liquid-button px-5 py-3 text-sm font-semibold border-indigo-200/70 bg-indigo-100/80 text-indigo-600 hover:ring-indigo-200/60';
  const accentEmerald = isDark
    ? 'liquid-button px-5 py-3 text-sm font-semibold border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:ring-emerald-300/55'
    : 'liquid-button px-5 py-3 text-sm font-semibold border-emerald-200/70 bg-emerald-100/80 text-emerald-600 hover:ring-emerald-200/60';
  const chipButton = isDark
    ? 'liquid-button px-3 py-1 text-xs border-white/15 text-white/60 hover:text-white'
    : 'liquid-button px-3 py-1 text-xs border-slate-200/70 text-slate-500 hover:text-slate-800';

  const resolvedFileUrl = fileUrl ? `${API_BASE}${fileUrl}` : '';

  const refreshData = async () => {
    try {
      const [saved, history] = await Promise.all([fetchSavedDownloads(), fetchDownloadHistory()]);
      setSavedItems(saved.items ?? []);
      setHistoryItems(history.items ?? []);
    } catch (error) {
      addToast(error.message || 'Unable to load vault data.', 'error');
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const downloadFileBlob = async (path, fallbackName = 'download', showProgress = false) => {
    if (!path) return;
    setDownloadingFile(true);
    if (showProgress) setDownloadProgress(0);

    try {
      // All downloads go through /media endpoint (yt-dlp downloads to server)
      const url = `${API_BASE}${path}`;
      console.log('🔄 Downloading from:', url);
      const response = await fetch(url);
      console.log('📥 Response status:', response.status);
      if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      const chunks = [];

      if (reader && total > 0 && showProgress) {
        // Stream with progress tracking
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          loaded += value.length;
          const progress = Math.round((loaded / total) * 100);
          setDownloadProgress(progress);
        }

        const blob = new Blob(chunks);
        const filename = path.split('/').pop() || fallbackName;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } else {
        // Fallback without progress
        const blob = await response.blob();
        const filename = path.split('/').pop() || fallbackName;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }

      if (showProgress) {
        setDownloadProgress(100);
        setTimeout(() => setDownloadProgress(0), 2000); // Reset after 2 seconds
      }
    } catch (error) {
      addToast('Unable to download file.', 'error');
    } finally {
      setDownloadingFile(false);
    }
  };

  const handleDownload = async (targetFormat, targetUrl) => {
    const effectiveUrl = (targetUrl ?? url).trim();
    if (!effectiveUrl) {
      addToast('Paste a competitor link to download.', 'error');
      return;
    }
    const chosenFormat = targetFormat || format;
    setFormat(chosenFormat);
    setUrl(effectiveUrl);
    setIsDownloading(true);
    setFileUrl('');
    try {
      const { file_url, title } = await downloadMedia({ url: effectiveUrl, format: chosenFormat });
      setFileUrl(file_url);
      setLastTitle(title || effectiveUrl);
      addToast('Download complete! File saved to browser downloads.');

      // Automatically download the file to browser default location
      await downloadFileBlob(file_url, title || 'download', true);

      refreshData();
    } catch (error) {
      console.error('❌ Download error:', error);
      addToast(`Unable to download: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!fileUrl) {
      addToast('Download a file before saving it to the vault.', 'error');
      return;
    }
    try {
      await saveDownloadEntry({
        url,
        format,
        tags,
        fileUrl,
        title: lastTitle,
        toWorkspace: saveToWorkspace,
      });
      addToast('Saved to Inspiration Vault.');
      setTags('');
      refreshData();
    } catch (error) {
      addToast(error.message || 'Unable to save this clip.', 'error');
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearDownloadHistory();
      setHistoryItems([]);
      addToast('Recent downloads cleared.');
    } catch (error) {
      addToast(error.message || 'Unable to clear history.', 'error');
    }
  };

  const handleRemoveSaved = async (id) => {
    try {
      await deleteSavedDownload(id);
      setSavedItems((items) => items.filter((entry) => entry.id !== id));
      addToast('Removed from saved clips.');
    } catch (error) {
      addToast(error.message || 'Unable to remove clip.', 'error');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold theme-text-primary">Inspiration Vault</h1>
          <p className={['mt-2 max-w-2xl text-sm', subtleText].join(' ')}>
            Paste competitor links or drop saved clips. Growth OS keeps every winning ad, transcript, and hook organized so you can relaunch faster.
          </p>
        </div>
        <button
          type="button"
          className={outlineButton}
          onClick={() => {
            setUrl('');
            setFileUrl('');
            setLastTitle('');
          }}
        >
          Clear URL
        </button>
      </header>

      <div className="grid gap-8 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <GlassCard
            title="Pull a Competitor Clip"
            subtitle="Paste a link, choose the format, and keep the download handy."
          >
            <div className="flex flex-col gap-6">
              <label className={['space-y-3 text-sm', isDark ? 'text-white/70' : 'text-slate-600'].join(' ')}>
                <span>Content URL</span>
                <input
                  type="url"
                  className={[
                    'w-full rounded-md border px-5 py-4 text-sm shadow-inner focus:outline-none focus:ring-2',
                    isDark
                      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                      : 'border-slate-200/70 bg-white/85 text-slate-600 focus:border-sky-300 focus:ring-sky-200',
                  ].join(' ')}
                  placeholder="https://www.tiktok.com/..."
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
              </label>
              <div className="flex flex-wrap items-center gap-3 text-xs theme-text-muted">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value="mp4"
                    checked={format === 'mp4'}
                    onChange={() => setFormat('mp4')}
                  />
                  MP4 (video)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value="mp3"
                    checked={format === 'mp3'}
                    onChange={() => setFormat('mp3')}
                  />
                  MP3 (audio)
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  className={accentIndigo}
                  onClick={() => handleDownload('mp4')}
                  disabled={isDownloading}
                >
                  {isDownloading && format === 'mp4' ? 'Downloading…' : 'Download MP4'}
                </button>
                <button
                  type="button"
                  className={accentEmerald}
                  onClick={() => handleDownload('mp3')}
                  disabled={isDownloading}
                >
                  {isDownloading && format === 'mp3' ? 'Downloading…' : 'Download MP3'}
                </button>
              </div>
              {(resolvedFileUrl || downloadProgress > 0) && (
                <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.3em] theme-text-muted">
                    {downloadProgress > 0 && downloadProgress < 100 ? 'Downloading...' : 'Latest Download'}
                  </p>
                  <p className="theme-text-primary">{lastTitle || 'Untitled download'}</p>

                  {/* Download Progress Bar */}
                  {downloadProgress > 0 && (
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs theme-text-muted">Progress</span>
                        <span className="text-xs theme-text-primary">{downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.3em] theme-text-muted">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      className={[
                        'w-full rounded-md border px-4 py-2 text-xs focus:outline-none focus:ring-2',
                        isDark
                          ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
                          : 'border-slate-200/70 bg-white/85 text-slate-600 focus:border-sky-300 focus:ring-sky-200',
                      ].join(' ')}
                      placeholder="UGC, Q4 winner, testimonial"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                    />
                    <label className="mt-2 inline-flex items-center gap-2 text-xs theme-text-muted">
                      <input
                        type="checkbox"
                        checked={saveToWorkspace}
                        onChange={(event) => setSaveToWorkspace(event.target.checked)}
                      />
                      Save to Workspace Library
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" className={chipButton} onClick={handleSave}>
                      Save to Vault
                    </button>
                    <button
                      type="button"
                      className={chipButton}
                      onClick={() => {
                        navigator.clipboard
                          .writeText(url)
                          .then(() => addToast('URL copied.'))
                          .catch(() => addToast('Could not copy URL.', 'error'));
                      }}
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard title="Saved Clips" subtitle="Tag angles you want to revisit and re-download.">
            {savedItems.length === 0 ? (
              <p className="text-sm theme-text-muted">No saved videos yet. Download one and hit “Save to Vault”.</p>
            ) : (
              <div className="space-y-3">
                {savedItems.map((item) => {
                  const name = getDisplayName(item);
                  return (
                    <div
                      key={item.id}
                      className="liquid-interactive flex items-start justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium theme-text-primary">{name}</p>
                        <p className="text-xs theme-text-muted">Saved {new Date(item.saved_at).toLocaleString()}</p>
                        {item.tags?.length ? (
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-white/40">
                            {item.tags.map((tag) => (
                              <span key={tag} className="rounded-full border border-white/10 px-2 py-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="liquid-button text-xs"
                        onClick={() => {
                          setLastTitle(name);
                          handleDownload(item.format, item.url);
                        }}
                      >
                        Re-download
                      </button>
                      <button
                        type="button"
                        className="liquid-button text-xs"
                        onClick={() => handleRemoveSaved(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-8">
          <OutputPanel activeTab="modified" />

          <GlassCard
            title="Recent Downloads"
            subtitle="Last 10 pulls across the workspace."
            actions={
              historyItems.length ? (
                <button type="button" className="liquid-button text-xs" onClick={handleClearHistory}>
                  Clear All
                </button>
              ) : null
            }
          >
            {historyItems.length === 0 ? (
              <p className="text-sm theme-text-muted">Downloads you run will appear here.</p>
            ) : (
              <div className={['space-y-3 text-sm', subtleText].join(' ')}>
                {historyItems.map((entry) => {
                  const name = getDisplayName(entry);
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="theme-text-primary">{name}</p>
                        <p className="text-xs theme-text-muted">
                          {entry.format.toUpperCase()} · {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {entry.file_url && (
                          <button
                            type="button"
                            className="liquid-button text-xs"
                            onClick={() => downloadFileBlob(entry.file_url, name)}
                            disabled={downloadingFile}
                          >
                            {downloadingFile ? 'Preparing…' : 'Download'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="liquid-button text-xs"
                          onClick={() => {
                            setUrl(entry.url);
                            setFormat(entry.format);
                            setLastTitle(name);
                          }}
                        >
                          Use URL
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
