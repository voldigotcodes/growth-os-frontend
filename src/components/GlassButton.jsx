import { forwardRef } from 'react';
import { GlassUI } from '../utils/glassUI.js';

/**
 * Enhanced Glass Button Component - Apple 2025 Liquid Glass Design Language
 * Provides declarative button styling with liquid glass materials and interactions
 */
const GlassButton = forwardRef(({
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  glow = false,
  className = '',
  onClick,
  ...props
}, ref) => {

  const buttonClasses = GlassUI.button({
    variant,
    size,
    disabled: disabled || loading,
    className: [
      // Add icon spacing
      icon && children ? (iconPosition === 'left' ? 'pl-3' : 'pr-3') : '',
      // Add glow effect for special buttons
      glow && !disabled && !loading ? 'shadow-glow-blue animate-liquid-glow' : '',
      // Loading state
      loading ? 'cursor-wait' : '',
      className
    ].filter(Boolean).join(' ')
  });

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <span className={[
        'flex items-center justify-center',
        size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5',
        loading ? 'animate-spin' : ''
      ].join(' ')}>
        {loading ? '⏳' : icon}
      </span>
    );
  };

  const renderContent = () => {
    if (loading && !children) {
      return (
        <>
          <span className="animate-spin">⏳</span>
          <span className="ml-2">Loading...</span>
        </>
      );
    }

    if (!icon) {
      return children;
    }

    if (iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          {children && <span className="ml-2">{children}</span>}
        </>
      );
    } else {
      return (
        <>
          {children && <span className="mr-2">{children}</span>}
          {renderIcon()}
        </>
      );
    }
  };

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

GlassButton.displayName = 'GlassButton';

// Export specialized button variants
export const PrimaryGlassButton = (props) => (
  <GlassButton variant="primary" glow {...props} />
);

export const SecondaryGlassButton = (props) => (
  <GlassButton variant="secondary" {...props} />
);

export const GhostGlassButton = (props) => (
  <GlassButton variant="ghost" {...props} />
);

export default GlassButton;