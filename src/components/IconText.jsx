import { memo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

function IconText({
  icon,
  children,
  variant = 'default',
  size = 'md',
  alignment = 'left',
  className = '',
  ...props
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'gap-2 text-sm',
    md: 'gap-3 text-base',
    lg: 'gap-4 text-lg'
  };

  const iconSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const variantClasses = {
    default: isDark ? 'text-white/80' : 'text-slate-700',
    primary: isDark ? 'text-white' : 'text-slate-900',
    muted: isDark ? 'text-white/60' : 'text-slate-500',
    accent: isDark ? 'text-primary-400' : 'text-primary-600'
  };

  return (
    <div
      className={[
        'flex items-center',
        sizeClasses[size],
        alignmentClasses[alignment],
        variantClasses[variant],
        className
      ].join(' ')}
      {...props}
    >
      {icon && (
        <span
          className={[
            'flex-shrink-0',
            iconSizeClasses[size]
          ].join(' ')}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

export default memo(IconText);