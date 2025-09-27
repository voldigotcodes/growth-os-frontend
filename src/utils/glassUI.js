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

export default glass;