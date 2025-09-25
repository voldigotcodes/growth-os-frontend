import { memo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

function PrimaryButton({
  children,
  icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-[14px]',
    md: 'px-6 py-3 text-base rounded-[18px]',
    lg: 'px-7 py-3.5 text-lg rounded-[22px]'
  };

  const variantClasses = {
    primary: isDark
      ? 'bg-gradient-to-r from-sky-500/60 to-indigo-500/60 text-white shadow-[0_25px_55px_rgba(46,114,255,0.35)]'
      : 'bg-gradient-to-r from-sky-400 to-indigo-400 text-white shadow-[0_25px_55px_rgba(46,114,255,0.25)]',
    secondary: 'liquid-button text-white/85',
    outline: isDark
      ? 'border border-white/25 bg-transparent text-white/85 hover:bg-white/10'
      : 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100/60'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  const loadingClasses = 'cursor-wait';

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 transition-transform duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60',
        sizeClasses[size],
        variantClasses[variant],
        disabled && disabledClasses,
        loading && loadingClasses,
        className
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin text-lg">⚪</span>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
          )}
          <span className="min-w-0">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}

export default memo(PrimaryButton);
