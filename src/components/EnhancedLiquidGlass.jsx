import React from 'react';

/**
 * Enhanced Liquid Glass component that demonstrates all the Apple Liquid Glass principles
 * This component can be used as a reference or imported directly
 */

// SVG Filters for displacement effects
export function LiquidGlassFilters() {
  return (
    <svg
      className="fixed w-0 h-0 pointer-events-none"
      aria-hidden="true"
      style={{ position: 'fixed', width: 0, height: 0 }}
    >
      <defs>
        {/* Subtle displacement for gentle liquid effect */}
        <filter id="liquidDisplacementSubtle">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.008"
            numOctaves="2"
            result="turbulence"
            seed="5"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Medium displacement for interactive states */}
        <filter id="liquidDisplacementMedium">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.012"
            numOctaves="3"
            result="turbulence"
            seed="7"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="15"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Strong displacement for dramatic effects */}
        <filter id="liquidDisplacementStrong">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.015"
            numOctaves="4"
            result="turbulence"
            seed="11"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="25"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Caustic light patterns */}
        <filter id="liquidCaustics">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="3"
            result="causticNoise"
          />
          <feColorMatrix
            in="causticNoise"
            type="saturate"
            values="0"
            result="causticGray"
          />
          <feComponentTransfer in="causticGray" result="causticContrast">
            <feFuncA type="discrete" tableValues="0 0.2 0.5 0.8 1"/>
          </feComponentTransfer>
          <feComposite
            in="SourceGraphic"
            in2="causticContrast"
            operator="screen"
          />
        </filter>
      </defs>
    </svg>
  );
}

// Enhanced Liquid Glass Card Component
export function LiquidGlassCard({
  children,
  className = '',
  variant = 'regular', // 'regular' | 'clear' | 'thick'
  tint = null, // 'primary' | 'success' | 'warning' | 'danger'
  size = 'medium', // 'small' | 'medium' | 'large'
  displacement = false,
  interactive = true,
  ...props
}) {
  const baseClasses = 'glass-panel liquid';
  const variantClasses = {
    regular: '',
    clear: 'glass-panel-clear',
    thick: 'glass-large'
  };
  const sizeClasses = {
    small: 'glass-small p-4',
    medium: 'p-6',
    large: 'glass-large p-8'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    tint ? `glass-tint-${tint}` : '',
    displacement ? 'liquid-displacement' : '',
    interactive ? 'liquid-spring' : 'glass-static',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      <LiquidGlassFilters />
      <div className={classes} {...props}>
        {children}
      </div>
    </>
  );
}

// Navigation Glass Component (for sidebars, toolbars)
export function LiquidGlassNavigation({ children, className = '', ...props }) {
  return (
    <div className={`glass-navigation ${className}`} {...props}>
      {children}
    </div>
  );
}

// Interactive Liquid Button
export function LiquidGlassButton({
  children,
  className = '',
  tint = 'primary',
  size = 'medium',
  ...props
}) {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const classes = [
    'liquid-interactive liquid-spring',
    tint ? `glass-tint-${tint}` : '',
    sizeClasses[size],
    'rounded-xl font-medium transition-all',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

// Usage Examples Component
export function LiquidGlassExamples() {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold theme-text-primary">Enhanced Liquid Glass Examples</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Regular Card */}
        <LiquidGlassCard>
          <h3 className="text-lg font-semibold theme-text-primary mb-2">Regular Card</h3>
          <p className="theme-text-secondary">
            Standard liquid glass with subtle effects and adaptive behaviors.
          </p>
        </LiquidGlassCard>

        {/* Enhanced Card with Displacement */}
        <LiquidGlassCard displacement tint="primary">
          <h3 className="text-lg font-semibold theme-text-primary mb-2">Enhanced Card</h3>
          <p className="theme-text-secondary">
            With displacement effects and primary tinting for emphasis.
          </p>
        </LiquidGlassCard>

        {/* Clear Variant */}
        <LiquidGlassCard variant="clear" size="large">
          <h3 className="text-lg font-semibold theme-text-primary mb-2">Clear Variant</h3>
          <p className="theme-text-secondary">
            Transparent variant for media-rich content backgrounds.
          </p>
        </LiquidGlassCard>

        {/* Success Tinted */}
        <LiquidGlassCard tint="success">
          <h3 className="text-lg font-semibold theme-text-primary mb-2">Success Tint</h3>
          <p className="theme-text-secondary">
            Tinted with success color for positive actions.
          </p>
        </LiquidGlassCard>
      </div>

      {/* Button Examples */}
      <div className="flex flex-wrap gap-4">
        <LiquidGlassButton tint="primary">Primary Action</LiquidGlassButton>
        <LiquidGlassButton tint="success">Success Action</LiquidGlassButton>
        <LiquidGlassButton tint="warning">Warning Action</LiquidGlassButton>
        <LiquidGlassButton tint="danger">Danger Action</LiquidGlassButton>
      </div>

      {/* Navigation Example */}
      <LiquidGlassNavigation className="p-6 rounded-xl">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">Navigation Panel</h3>
        <div className="space-y-2">
          <LiquidGlassButton className="w-full text-left justify-start">
            Dashboard
          </LiquidGlassButton>
          <LiquidGlassButton className="w-full text-left justify-start">
            Settings
          </LiquidGlassButton>
          <LiquidGlassButton className="w-full text-left justify-start">
            Profile
          </LiquidGlassButton>
        </div>
      </LiquidGlassNavigation>
    </div>
  );
}

export default {
  LiquidGlassFilters,
  LiquidGlassCard,
  LiquidGlassNavigation,
  LiquidGlassButton,
  LiquidGlassExamples
};