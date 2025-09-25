import { useState } from 'react';
import { downloadFile, generateOutputFilename, isDownloadableOutput } from '../../utils/downloadHelpers.js';
import { useToast } from '../ToastContext.jsx';

function OutputDownloadModal({ open, onClose, outputs = [] }) {
  const [selectedOutputs, setSelectedOutputs] = useState(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const { addToast } = useToast();

  // Debug mode
  const debugMode = new URLSearchParams(window.location.search).has('debug') ||
                    localStorage.getItem('workflow-debug') === 'true';

  if (!open) return null;

  const handleSelectOutput = (outputKey) => {
    const newSelected = new Set(selectedOutputs);
    if (newSelected.has(outputKey)) {
      newSelected.delete(outputKey);
    } else {
      newSelected.add(outputKey);
    }
    setSelectedOutputs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOutputs.size === outputs.length) {
      setSelectedOutputs(new Set());
    } else {
      setSelectedOutputs(new Set(outputs.map((_, index) => index)));
    }
  };

  const downloadSingleFile = async (url, filename) => {
    try {
      const result = await downloadFile(url, filename, {
        debug: debugMode,
        includeAuth: true
      });
      return result;
    } catch (error) {
      addToast(`Failed to download ${filename}: ${error.message}`, 'error');
      throw error;
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedOutputs.size === 0) return;

    setIsDownloading(true);
    try {
      const selectedItems = Array.from(selectedOutputs).map(index => outputs[index]);

      let successCount = 0;
      let errorCount = 0;

      for (const output of selectedItems) {
        const url = output?.url ?? output?.value?.url;
        if (url) {
          try {
            const filename = generateOutputFilename(output);
            await downloadSingleFile(url, filename);
            successCount++;
          } catch (error) {
            errorCount++;
            if (debugMode) {
              console.error('Failed to download output:', output, error);
            }
          }
        }
      }

      // Show summary
      if (successCount > 0 && errorCount === 0) {
        addToast(`Downloaded ${successCount} file${successCount !== 1 ? 's' : ''} successfully`, 'success');
      } else if (successCount > 0 && errorCount > 0) {
        addToast(`Downloaded ${successCount} files, ${errorCount} failed`, 'warning');
      } else if (errorCount > 0) {
        addToast(`All ${errorCount} downloads failed`, 'error');
      }

      onClose();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const output of outputs) {
        const url = output?.url ?? output?.value?.url;
        if (url) {
          try {
            const filename = generateOutputFilename(output);
            await downloadSingleFile(url, filename);
            successCount++;
          } catch (error) {
            errorCount++;
            if (debugMode) {
              console.error('Failed to download output:', output, error);
            }
          }
        }
      }

      // Show summary
      if (successCount > 0 && errorCount === 0) {
        addToast(`Downloaded ${successCount} file${successCount !== 1 ? 's' : ''} successfully`, 'success');
      } else if (successCount > 0 && errorCount > 0) {
        addToast(`Downloaded ${successCount} files, ${errorCount} failed`, 'warning');
      } else if (errorCount > 0) {
        addToast(`All ${errorCount} downloads failed`, 'error');
      }

      onClose();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getFileExtension = (url) => {
    try {
      const pathname = new URL(url).pathname;
      const extension = pathname.split('.').pop();
      return extension && extension !== pathname ? `.${extension}` : '';
    } catch {
      return '';
    }
  };

  const validOutputs = outputs.filter(isDownloadableOutput);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xl">
      <div className="glass-panel liquid relative mx-4 w-full max-w-md overflow-hidden shadow-[0_40px_80px_rgba(15,23,42,0.45)]">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Download Outputs</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 hover:text-white"
              disabled={isDownloading}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {validOutputs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-white/70">No downloadable outputs available.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-white/70">{validOutputs.length} output{validOutputs.length !== 1 ? 's' : ''} available</p>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs uppercase tracking-[0.3em] text-sky-200 hover:text-sky-100"
                  disabled={isDownloading}
                >
                  {selectedOutputs.size === validOutputs.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="mb-6 max-h-60 space-y-2 overflow-y-auto">
                {validOutputs.map((output, index) => {
                  const url = output?.url ?? output?.value?.url;
                  const label = output?.label ?? `${output.node_id} · ${output.port_id}`;
                  const filename = generateOutputFilename(output);
                  const isSelected = selectedOutputs.has(index);

                  return (
                    <label
                      key={`${output.node_id}-${output.port_id}`}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                        isSelected
                          ? 'border-sky-300/60 bg-sky-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOutput(index)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
                        disabled={isDownloading}
                      />
                      <div className="flex-1">
                        <p className="text-xs text-white/90">{label}</p>
                        <p className="text-[10px] text-white/70 truncate">{filename}</p>
                        {debugMode && (
                          <p className="text-[9px] text-orange-300/70 truncate font-mono mt-1">{url}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="flex-1 rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-500/30 disabled:opacity-50"
                >
                  {isDownloading ? 'Downloading...' : `Download All (${validOutputs.length})`}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSelected}
                  disabled={isDownloading || selectedOutputs.size === 0}
                  className="flex-1 rounded-xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-200 transition-colors hover:bg-sky-500/30 disabled:opacity-50"
                >
                  {isDownloading ? 'Downloading...' : `Download Selected (${selectedOutputs.size})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OutputDownloadModal;