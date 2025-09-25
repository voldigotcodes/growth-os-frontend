import { useTheme } from '../context/ThemeContext.jsx';
import { useEffect, useRef } from 'react';

// Liquid Glass SVG Filters Component
function LiquidGlassFilters() {
  return (
    <svg className="liquid-glass-filters" aria-hidden="true">
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

const darkGlow =
  "before:absolute before:-inset-x-12 before:-top-40 before:h-72 before:rounded-full before:bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.25),rgba(56,189,248,0.15)_40%,transparent_70%)] before:blur-3xl before:content-[''] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500";

const lightGlow =
  "before:absolute before:-inset-x-12 before:-top-36 before:h-72 before:rounded-full before:bg-[radial-gradient(ellipse_at_top,rgba(110,231,183,0.35),rgba(56,189,248,0.3)_35%,rgba(244,114,182,0.25)_65%,transparent_85%)] before:blur-3xl before:content-[''] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500";

export default function GlassCard({
  title,
  subtitle,
  actions,
  className = '',
  children,
  allowOverflow = false,
  interactive = true,
  liquid = true,
  enhanced = false, // New prop for enhanced liquid glass effects
  tint = null, // Optional tint: 'primary', 'success', 'warning', 'danger'
  adaptive = true, // Enable adaptive behaviors
  displacement = false, // Enable displacement effects
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRef = useRef(null);

  // Handle adaptive shadow based on scroll position
  useEffect(() => {
    if (!adaptive || !cardRef.current) return;

    const handleScroll = () => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const isNearContent = rect.top < window.innerHeight * 0.8;

      if (isNearContent) {
        cardRef.current.style.setProperty('--shadow-intensity', '1.2');
      } else {
        cardRef.current.style.setProperty('--shadow-intensity', '1');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [adaptive]);

  const containerClass = [
    'relative rounded-xl glass-panel p-4 sm:p-6 lg:p-8 transition-all duration-300',
    allowOverflow ? 'overflow-visible' : 'overflow-hidden',
    interactive ? '' : 'glass-static',
    liquid ? 'liquid' : '',
    enhanced ? 'liquid-enhanced' : '',
    adaptive ? 'liquid-adaptive' : '',
    displacement ? 'liquid-displacement' : '',
    tint ? `glass-tint-${tint}` : '',
    isDark ? 'shadow-soft hover:border-white/25' : 'shadow-[0_35px_65px_rgba(148,163,184,0.25)] hover:border-sky-300/70',
    isDark ? darkGlow : lightGlow,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <LiquidGlassFilters />
      <section ref={cardRef} className={containerClass}>
        {(title || actions) && (
          <header className="mb-4 sm:mb-6 flex items-start justify-between gap-3">
            <div className="space-y-1">
              {title && <h2 className="text-lg font-semibold leading-6 theme-text-primary">{title}</h2>}
              {subtitle && (
                <p
                  className={`text-xs leading-5 line-clamp-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </header>
        )}
        <div className={['relative z-10 space-y-6', isDark ? 'text-white/80' : 'text-slate-600'].join(' ')}>
          {children}
        </div>
      </section>
    </>
  );
}

// Export a enhanced variant for special use cases
export function EnhancedGlassCard(props) {
  return (
    <GlassCard
      {...props}
      enhanced={true}
      displacement={true}
      adaptive={true}
      liquid={true}
    />
  );
}
