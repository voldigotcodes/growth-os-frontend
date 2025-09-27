import { memo } from 'react';

/**
 * Liquid Glass Logo Component - Apple 2025 Design Language
 * Features concentric glass layers, liquid refraction, and subtle animation
 */
const LiquidGlassLogo = memo(({
  size = 64,
  animate = true,
  variant = 'full', // 'full', 'icon', 'minimal'
  className = ''
}) => {
  const logoId = `liquid-logo-${Math.random().toString(36).substr(2, 9)}`;

  const renderFullLogo = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`${animate ? 'animate-float-gentle' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Liquid glass gradient */}
        <linearGradient id={`${logoId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)">
            {animate && (
              <animate
                attributeName="stop-color"
                values="rgba(59, 130, 246, 0.8);rgba(147, 51, 234, 0.8);rgba(236, 72, 153, 0.8);rgba(59, 130, 246, 0.8)"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="50%" stopColor="rgba(147, 51, 234, 0.9)">
            {animate && (
              <animate
                attributeName="stop-color"
                values="rgba(147, 51, 234, 0.9);rgba(236, 72, 153, 0.9);rgba(59, 130, 246, 0.9);rgba(147, 51, 234, 0.9)"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="rgba(236, 72, 153, 0.8)">
            {animate && (
              <animate
                attributeName="stop-color"
                values="rgba(236, 72, 153, 0.8);rgba(59, 130, 246, 0.8);rgba(147, 51, 234, 0.8);rgba(236, 72, 153, 0.8)"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>

        {/* Inner glow */}
        <radialGradient id={`${logoId}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
          <stop offset="70%" stopColor="rgba(255, 255, 255, 0.2)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Caustic reflection pattern */}
        <filter id={`${logoId}-caustics`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="5" stitchTiles="stitch">
            {animate && (
              <animateTransform
                attributeName="baseFrequency"
                type="scale"
                values="0.02;0.04;0.02"
                dur="6s"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0.1 0.3 0.6 0.9" />
          </feComponentTransfer>
          <feComposite operator="screen" in2="SourceGraphic" />
        </filter>

        {/* Glass distortion */}
        <filter id={`${logoId}-distortion`}>
          <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2">
            {animate && (
              <animateTransform
                attributeName="baseFrequency"
                type="scale"
                values="0.008;0.012;0.008"
                dur="8s"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Outer glass ring */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1"
        filter={`url(#${logoId}-distortion)`}
      />

      {/* Middle glass layer */}
      <circle
        cx="32"
        cy="32"
        r="22"
        fill={`url(#${logoId}-gradient)`}
        opacity="0.4"
        filter={`url(#${logoId}-caustics)`}
      />

      {/* Inner core with growth symbol */}
      <g transform="translate(32, 32)">
        {/* Central orb */}
        <circle
          cx="0"
          cy="0"
          r="14"
          fill={`url(#${logoId}-glow)`}
          opacity="0.8"
        />

        {/* Growth arrows - representing upward trajectory */}
        <g fill="rgba(255, 255, 255, 0.9)" opacity="0.9">
          {/* Main arrow */}
          <path d="M0,-8 L-3,-5 L-1,-5 L-1,2 L1,2 L1,-5 L3,-5 Z" />

          {/* Secondary smaller arrows */}
          <path d="M-6,-3 L-8,-1 L-7,-1 L-7,4 L-5,4 L-5,-1 L-4,-1 Z" opacity="0.7" />
          <path d="M6,-3 L4,-1 L5,-1 L5,4 L7,4 L7,-1 L8,-1 Z" opacity="0.7" />

          {/* Chart bars at bottom representing data/metrics */}
          <g transform="translate(0, 6)" opacity="0.6">
            <rect x="-6" y="0" width="2" height="3" />
            <rect x="-3" y="-1" width="2" height="4" />
            <rect x="1" y="-2" width="2" height="5" />
            <rect x="4" y="0" width="2" height="3" />
          </g>
        </g>
      </g>

      {/* Highlight reflection */}
      <ellipse
        cx="32"
        cy="20"
        rx="18"
        ry="8"
        fill="rgba(255, 255, 255, 0.2)"
        opacity="0.6"
        filter={`url(#${logoId}-distortion)`}
      />
    </svg>
  );

  const renderIconOnly = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`${animate ? 'animate-liquid-glow' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${logoId}-icon-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.9)" />
          <stop offset="50%" stopColor="rgba(147, 51, 234, 1)" />
          <stop offset="100%" stopColor="rgba(236, 72, 153, 0.9)" />
        </linearGradient>
      </defs>

      {/* Simplified glass circle */}
      <circle
        cx="16"
        cy="16"
        r="14"
        fill={`url(#${logoId}-icon-gradient)`}
        opacity="0.8"
      />

      {/* Growth symbol */}
      <g transform="translate(16, 16)" fill="white" opacity="0.95">
        <path d="M0,-6 L-2,-4 L-1,-4 L-1,2 L1,2 L1,-4 L2,-4 Z" />
        <g transform="translate(0, 4)" opacity="0.7">
          <rect x="-4" y="0" width="1.5" height="2" />
          <rect x="-2" y="-1" width="1.5" height="3" />
          <rect x="0.5" y="-2" width="1.5" height="4" />
          <rect x="2.5" y="0" width="1.5" height="2" />
        </g>
      </g>
    </svg>
  );

  const renderMinimal = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${animate ? 'animate-pulse' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${logoId}-minimal-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 1)" />
          <stop offset="100%" stopColor="rgba(236, 72, 153, 1)" />
        </linearGradient>
      </defs>

      <g fill={`url(#${logoId}-minimal-gradient)`} opacity="0.9">
        <path d="M12,4 L10,6 L11,6 L11,14 L13,14 L13,6 L14,6 Z" />
        <g transform="translate(12, 16)">
          <rect x="-6" y="0" width="2" height="3" />
          <rect x="-3" y="-1" width="2" height="4" />
          <rect x="1" y="-2" width="2" height="5" />
          <rect x="4" y="0" width="2" height="3" />
        </g>
      </g>
    </svg>
  );

  switch (variant) {
    case 'icon':
      return renderIconOnly();
    case 'minimal':
      return renderMinimal();
    default:
      return renderFullLogo();
  }
});

LiquidGlassLogo.displayName = 'LiquidGlassLogo';

export default LiquidGlassLogo;