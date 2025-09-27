/**
 * Liquid Glass UI Helper Library
 * Declarative SwiftUI-inspired utilities for React + Tailwind
 */

import { useTheme } from '../context/ThemeContext.jsx';
import { useCallback, useEffect, useState } from 'react';

// Core Glass Material Classes
export const glassClasses = {
  // Base glass panels
  panel: 'glass-panel rounded-3xl',
  panelLight: 'glass-panel-light rounded-3xl',
  panelDark: 'glass-panel-dark rounded-3xl',

  // Interactive elements
  button: 'glass-button rounded-2xl px-4 py-2 font-medium transition-all duration-200',
  buttonPrimary: 'glass-button-primary rounded-2xl px-6 py-3 font-semibold transition-all duration-200',
  buttonSecondary: 'glass-button-secondary rounded-2xl px-4 py-2 font-medium transition-all duration-200',

  // Inputs
  input: 'glass-input rounded-2xl px-4 py-3 w-full',
  textarea: 'glass-textarea rounded-2xl px-4 py-3 w-full min-h-[120px]',

  // Navigation
  nav: 'glass-nav w-full z-50',
  sidebar: 'glass-sidebar w-64',

  // Cards and containers
  card: 'glass-card',
  cardFloat: 'glass-card-float',

  // Effects
  ripple: 'glass-ripple',
  morph: 'glass-morph',
  glow: 'glass-glow',
  glowBlue: 'glass-glow-blue',
  glowPurple: 'glass-glow-purple',
  glowPink: 'glass-glow-pink',

  // Workflow specific
  node: 'glass-node',
  nodeSelected: 'glass-node-selected',
  nodeRunning: 'glass-node-running',

  // Text with adaptive contrast
  textAdaptive: 'glass-text-adaptive',

  // Badges and status
  badge: 'glass-badge',
  toggle: 'glass-toggle',
  toggleActive: 'glass-toggle-active',
};

/**
 * Adaptive glass class selector based on theme and context
 */
export const useGlassClasses = () => {
  const { theme } = useTheme();

  const getAdaptiveClass = useCallback((baseClass, options = {}) => {
    const { variant = 'auto', glow = false, morph = false, ripple = false } = options;

    let classes = [baseClass];

    // Theme-specific adaptations
    if (variant === 'auto') {
      if (theme === 'dark') {
        classes.push('dark:border-white/15 dark:bg-slate-900/20');
      } else {
        classes.push('border-slate-200/20 bg-white/10');
      }
    }

    // Effect modifiers
    if (glow) classes.push(glassClasses.glow);
    if (morph) classes.push(glassClasses.morph);
    if (ripple) classes.push(glassClasses.ripple);

    return classes.join(' ');
  }, [theme]);

  return { getAdaptiveClass, theme };
};

/**
 * Glass button component generator
 */
export const createGlassButton = (variant = 'secondary', options = {}) => {
  const baseClass = variant === 'primary' ? glassClasses.buttonPrimary : glassClasses.buttonSecondary;
  const { ripple = true, morph = true, ...restOptions } = options;

  return `${baseClass} ${ripple ? glassClasses.ripple : ''} ${morph ? glassClasses.morph : ''}`;
};

/**
 * Glass panel generator with adaptive sizing
 */
export const createGlassPanel = (size = 'md', options = {}) => {
  const sizes = {
    sm: 'p-4 rounded-2xl',
    md: 'p-6 rounded-3xl',
    lg: 'p-8 rounded-3xl',
    xl: 'p-10 rounded-3xl',
  };

  const { float = false, glow = false } = options;

  let classes = [glassClasses.panel, sizes[size]];

  if (float) classes.push('hover:-translate-y-1 shadow-2xl');
  if (glow) classes.push(glassClasses.glow);

  return classes.join(' ');
};

/**
 * Workflow-specific glass utilities
 */
export const workflowGlass = {
  node: (state = 'default') => {
    const baseClass = glassClasses.node;

    switch (state) {
      case 'selected':
        return `${baseClass} ${glassClasses.nodeSelected}`;
      case 'running':
        return `${baseClass} ${glassClasses.nodeRunning}`;
      case 'error':
        return `${baseClass} border-red-400/40 bg-red-500/10 shadow-red-500/20`;
      default:
        return baseClass;
    }
  },

  edge: (active = false) => {
    return active ? 'glass-edge-active' : 'glass-edge';
  },
};

/**
 * Liquid gradient definitions for SVG edges
 */
export const LiquidGradientDefs = () => (
  <defs>
    <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)">
        <animate attributeName="stop-color"
          values="rgba(59, 130, 246, 0.8);rgba(147, 51, 234, 0.8);rgba(236, 72, 153, 0.8);rgba(34, 197, 94, 0.8);rgba(59, 130, 246, 0.8)"
          dur="4s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stopColor="rgba(147, 51, 234, 0.9)">
        <animate attributeName="stop-color"
          values="rgba(147, 51, 234, 0.9);rgba(236, 72, 153, 0.9);rgba(34, 197, 94, 0.9);rgba(59, 130, 246, 0.9);rgba(147, 51, 234, 0.9)"
          dur="4s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stopColor="rgba(236, 72, 153, 0.8)">
        <animate attributeName="stop-color"
          values="rgba(236, 72, 153, 0.8);rgba(34, 197, 94, 0.8);rgba(59, 130, 246, 0.8);rgba(147, 51, 234, 0.8);rgba(236, 72, 153, 0.8)"
          dur="4s" repeatCount="indefinite" />
      </stop>
    </linearGradient>

    <linearGradient id="liquidGradientFast" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="rgba(34, 197, 94, 1.0)">
        <animate attributeName="stop-color"
          values="rgba(34, 197, 94, 1.0);rgba(59, 130, 246, 1.0);rgba(147, 51, 234, 1.0);rgba(34, 197, 94, 1.0)"
          dur="1.5s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stopColor="rgba(59, 130, 246, 1.0)">
        <animate attributeName="stop-color"
          values="rgba(59, 130, 246, 1.0);rgba(147, 51, 234, 1.0);rgba(34, 197, 94, 1.0);rgba(59, 130, 246, 1.0)"
          dur="1.5s" repeatCount="indefinite" />
      </stop>
    </linearGradient>
  </defs>
);

/**
 * Background color sampling for adaptive glass
 */
export const useAdaptiveGlass = (elementRef) => {
  const [adaptiveStyles, setAdaptiveStyles] = useState({});

  useEffect(() => {
    if (!elementRef?.current) return;

    const observer = new MutationObserver(() => {
      // Simple adaptive logic - in a real app, you might sample the background
      const computedStyle = getComputedStyle(elementRef.current.parentElement || document.body);
      const bgColor = computedStyle.backgroundColor;

      // Determine if background is light or dark
      const isLightBg = bgColor.includes('rgb(255') || bgColor.includes('white');

      setAdaptiveStyles({
        backgroundColor: isLightBg ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        borderColor: isLightBg ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
      });
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, [elementRef]);

  return adaptiveStyles;
};

/**
 * Glass animation utilities
 */
export const glassAnimations = {
  ripple: (event, elementRef) => {
    if (!elementRef?.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
      pointer-events: none;
      width: 0;
      height: 0;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
      animation: rippleExpand 0.6s ease-out forwards;
    `;

    elementRef.current.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  },

  morph: (elementRef, scale = 1.02) => {
    if (!elementRef?.current) return;

    elementRef.current.style.transform = `scale(${scale}) translateY(-2px)`;
    elementRef.current.style.filter = 'brightness(1.1)';

    const resetMorph = () => {
      elementRef.current.style.transform = '';
      elementRef.current.style.filter = '';
    };

    return resetMorph;
  },
};

/**
 * Theme-aware glass utilities
 */
export const themeGlass = {
  getTextColor: (theme) => {
    return theme === 'dark'
      ? 'text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]'
      : 'text-slate-900/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
  },

  getAccentGlow: (color, theme) => {
    const intensity = theme === 'dark' ? '0.4' : '0.2';
    const colors = {
      blue: `drop-shadow-[0_0_20px_rgba(59,130,246,${intensity})]`,
      purple: `drop-shadow-[0_0_20px_rgba(147,51,234,${intensity})]`,
      pink: `drop-shadow-[0_0_20px_rgba(236,72,153,${intensity})]`,
      green: `drop-shadow-[0_0_20px_rgba(34,197,94,${intensity})]`,
    };

    return colors[color] || colors.blue;
  },
};

export default {
  glassClasses,
  useGlassClasses,
  createGlassButton,
  createGlassPanel,
  workflowGlass,
  LiquidGradientDefs,
  useAdaptiveGlass,
  glassAnimations,
  themeGlass,
};