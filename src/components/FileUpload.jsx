import { useCallback, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function FileUpload({ label, hint, accept = '*', disabled = false, onFileSelected }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      if (!files || !files.length || disabled) return;
      const file = files[0];
      onFileSelected?.(file);
    },
    [disabled, onFileSelected]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const files = event.dataTransfer?.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const triggerBrowse = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const borderState = disabled
    ? isDark
      ? 'border-white/10 text-white/40'
      : 'border-slate-200 text-slate-400'
    : isDragging
    ? isDark
      ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100'
      : 'border-emerald-400 bg-emerald-50 text-emerald-700'
    : isDark
    ? 'border-white/20 text-white/70'
    : 'border-slate-300 text-slate-600';

  return (
    <div className="flex flex-col gap-3">
      {label && <p className="text-sm font-medium theme-text-primary">{label}</p>}
      <div
        className={[
          'group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center transition-all duration-300',
          'bg-white/5 text-sm backdrop-blur-xl',
          borderState,
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-emerald-300/60 hover:bg-emerald-500/10',
        ].join(' ')}
        onClick={triggerBrowse}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-3xl">
          ⬆️
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold theme-text-primary">Drop files here or browse</p>
          {hint && <p className="text-xs theme-text-muted">{hint}</p>}
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/30">Supports single file upload</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
