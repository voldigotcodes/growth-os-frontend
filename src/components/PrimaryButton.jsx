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
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };

  const variantClasses = {
    primary: [
      'font-semibold transition-all duration-300 focus:outline-none',
      isDark
        ? 'bg-system-blue text-white shadow-glass hover:shadow-glass-lg'
        : 'bg-system-blue text-white shadow-lg hover:shadow-xl',
      'hover:scale-[1.02] active:scale-[0.98]',
      'transition-apple-ease focus-visible:outline-2 focus-visible:outline-system-blue focus-visible:outline-offset-2'
    ].join(' '),
    secondary: [
      'font-medium transition-all duration-300 focus:outline-none border material-regular',
      isDark
        ? 'border-white/20 text-white/90 hover:bg-white/15'
        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50',
      'transition-apple-ease focus-visible:outline-2 focus-visible:outline-neutral-500 focus-visible:outline-offset-2'
    ].join(' '),
    outline: [
      'font-medium transition-all duration-300 focus:outline-none border-2',
      isDark
        ? 'border-system-blue/60 text-system-blue hover:bg-system-blue/10'
        : 'border-system-blue text-system-blue hover:bg-system-blue/5',
      'transition-apple-ease focus-visible:outline-2 focus-visible:outline-system-blue focus-visible:outline-offset-2'
    ].join(' ')
  };

  const disabledClasses = [
    'opacity-50 cursor-not-allowed pointer-events-none'
  ].join(' ');

  const loadingClasses = [
    'cursor-wait'
  ].join(' ');

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2',
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