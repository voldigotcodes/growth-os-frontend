import { forwardRef, useState } from 'react';
import { GlassUI } from '../utils/glassUI.js';

/**
 * Enhanced Glass Input Component - Apple 2025 Liquid Glass Design Language
 * Provides adaptive glass input fields with enhanced contrast and readability
 */
const GlassInput = forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const inputClasses = GlassUI.input({
    error: !!error,
    size,
    className: [
      // Icon spacing
      icon && iconPosition === 'left' ? 'pl-10' : '',
      icon && iconPosition === 'right' ? 'pr-10' : '',
      // Enhanced focus state with liquid glass effects
      focused ? 'animate-liquid-glow' : '',
      className
    ].filter(Boolean).join(' ')
  });

  const containerClasses = [
    'relative group',
    // Focus ring container
    focused ? 'ring-2 ring-blue-400/20 rounded-lg' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium theme-text-primary">
          {label}
        </label>
      )}

      <div className={containerClasses}>
        {/* Icon */}
        {icon && (
          <div className={[
            'absolute inset-y-0 flex items-center pointer-events-none z-10',
            iconPosition === 'left' ? 'left-3' : 'right-3'
          ].join(' ')}>
            <span className={[
              'text-slate-500 dark:text-slate-400',
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
            ].join(' ')}>
              {icon}
            </span>
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          className={inputClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Liquid glass floating label effect */}
        {focused && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-lg animate-liquid-flow"></div>
          </div>
        )}
      </div>

      {/* Helper text or error message */}
      {(error || helperText) && (
        <p className={[
          'text-xs',
          error ? 'text-red-400' : 'theme-text-muted'
        ].join(' ')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

// Textarea variant
export const GlassTextarea = forwardRef(({
  label,
  error,
  helperText,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const textareaClasses = GlassUI.input({
    error: !!error,
    className: [
      'resize-none min-h-[100px]',
      focused ? 'animate-liquid-glow' : '',
      className
    ].filter(Boolean).join(' ')
  });

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium theme-text-primary">
          {label}
        </label>
      )}

      <div className="relative group">
        <textarea
          ref={ref}
          rows={rows}
          className={textareaClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Liquid glass floating effect */}
        {focused && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-lg animate-liquid-flow"></div>
          </div>
        )}
      </div>

      {/* Helper text or error message */}
      {(error || helperText) && (
        <p className={[
          'text-xs',
          error ? 'text-red-400' : 'theme-text-muted'
        ].join(' ')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

GlassTextarea.displayName = 'GlassTextarea';

export default GlassInput;