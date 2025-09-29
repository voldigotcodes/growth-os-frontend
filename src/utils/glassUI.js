/**
 * Glass UI Theme Utilities
 *
 * Provides consistent glass-morphism styling across the application.
 * Used by components to maintain visual consistency.
 */

// Base glass styling for panels, cards, and containers
export const glass = {
  panel: 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl',
  card: 'rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-lg hover:shadow-xl transition-shadow duration-300',
  button: 'rounded-lg border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 transition-colors duration-200',
  input: 'rounded-lg border border-white/15 bg-white/8 backdrop-blur-lg focus:border-white/30 focus:bg-white/12 transition-colors duration-200',
  nav: 'rounded-2xl border border-white/15 bg-white/8 backdrop-blur-2xl shadow-xl',
  badge: 'rounded-full border border-white/20 bg-white/10 backdrop-blur-lg text-xs font-medium px-2.5 py-1',
  dropdown: 'rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg',
};

// Enhanced glass styles with stronger effects
export const glassEnhanced = {
  panel: 'rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl',
  card: 'rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300',
  button: 'rounded-xl border border-white/25 bg-white/15 backdrop-blur-lg hover:bg-white/20 hover:shadow-lg transition-all duration-200',
};

// Workflow-specific glass styles
export const glassWorkflow = {
  node: 'rounded-xl border border-white/15 bg-white/8 backdrop-blur-lg shadow-lg hover:shadow-xl transition-shadow duration-300',
  edge: 'stroke-white/40 stroke-2',
  toolbar: 'rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg',
};

// Component-level styling utilities
export const GlassUI = {
  button: ({ variant = 'secondary', size = 'md', disabled = false, className = '' }) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm';

    const variantClasses = {
      primary: 'bg-blue-600/80 hover:bg-blue-700/80 text-white border border-blue-500/50 focus:ring-blue-400/50',
      secondary: 'bg-slate-700/60 hover:bg-slate-600/70 text-white border border-slate-600/50 focus:ring-slate-400/50',
      ghost: 'bg-transparent hover:bg-slate-700/30 text-slate-300 border border-slate-600/30 focus:ring-slate-400/50'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return [
      baseClasses,
      variantClasses[variant] || variantClasses.secondary,
      sizeClasses[size] || sizeClasses.md,
      disabledClasses,
      className
    ].filter(Boolean).join(' ');
  },

  input: ({ error = false, size = 'md', className = '' }) => {
    const baseClasses = 'block w-full rounded-lg border backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';

    const normalClasses = 'bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-500/70 focus:ring-blue-400/50';
    const errorClasses = 'bg-red-900/20 border-red-500/70 text-white placeholder-red-400 focus:border-red-400/70 focus:ring-red-400/50';

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    return [
      baseClasses,
      error ? errorClasses : normalClasses,
      sizeClasses[size] || sizeClasses.md,
      className
    ].filter(Boolean).join(' ');
  }
};

export default glass;