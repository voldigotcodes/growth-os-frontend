import { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import GlassCard from './GlassCard.jsx';
import GlassButton, { PrimaryGlassButton, SecondaryGlassButton, GhostGlassButton } from './GlassButton.jsx';
import GlassInput, { GlassTextarea } from './GlassInput.jsx';
import LiquidGlassLogo from './LiquidGlassLogo.jsx';
import { GlassUI } from '../utils/glassUI.js';

/**
 * Liquid Glass Showcase Component
 * Demonstrates Apple 2025 Liquid Glass design language implementation
 */
export default function LiquidGlassShowcase() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <LiquidGlassLogo size={96} animate variant="full" />
        <h1 className="text-4xl font-bold theme-text-primary">
          Apple 2025 Liquid Glass Design System
        </h1>
        <p className="text-lg theme-text-muted max-w-2xl mx-auto">
          Experience the future of interface design with translucent glass materials,
          adaptive colors, and fluid morphing interactions.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-3 justify-center">
        {['Overview', 'Components', 'Patterns', 'Guidelines'].map((item, index) => (
          <div
            key={item}
            className={GlassUI.badge({
              variant: index === 0 ? 'primary' : 'neutral',
              glow: index === 0,
              className: 'cursor-pointer'
            })}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Buttons Showcase */}
        <GlassCard
          title="Interactive Elements"
          subtitle="Liquid glass buttons with morphing states"
          enhanced
          liquid
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold theme-text-primary">Button Variants</h4>
              <div className="flex flex-wrap gap-3">
                <PrimaryGlassButton icon="✨" glow>
                  Primary Action
                </PrimaryGlassButton>
                <SecondaryGlassButton icon="🔧">
                  Secondary
                </SecondaryGlassButton>
                <GhostGlassButton icon="👁️">
                  Ghost
                </GhostGlassButton>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold theme-text-primary">Interactive States</h4>
              <div className="flex flex-wrap gap-3">
                <GlassButton variant="primary" loading>
                  Loading
                </GlassButton>
                <GlassButton variant="secondary" disabled>
                  Disabled
                </GlassButton>
                <GlassButton variant="primary" size="lg" glow>
                  Large with Glow
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Form Elements */}
        <GlassCard
          title="Form Controls"
          subtitle="Adaptive glass inputs with enhanced contrast"
          enhanced
          liquid
        >
          <div className="space-y-4">
            <GlassInput
              label="Full Name"
              placeholder="Enter your name"
              icon="👤"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />

            <GlassInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon="📧"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              helperText="We'll never share your email"
            />

            <GlassTextarea
              label="Message"
              placeholder="Tell us about your project..."
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
        </GlassCard>

        {/* Material Variants */}
        <GlassCard
          title="Glass Materials"
          subtitle="Different material densities for various contexts"
          enhanced
          liquid
        >
          <div className="space-y-4">
            <div className={GlassUI.panel({
              material: 'ultraThin',
              radius: 'md',
              className: 'p-4 text-center'
            })}>
              <p className="text-sm theme-text-primary">Ultra Thin</p>
              <p className="text-xs theme-text-muted">Subtle overlays</p>
            </div>

            <div className={GlassUI.panel({
              material: 'clear',
              radius: 'md',
              className: 'p-4 text-center'
            })}>
              <p className="text-sm theme-text-primary">Clear</p>
              <p className="text-xs theme-text-muted">Media-rich areas</p>
            </div>

            <div className={GlassUI.panel({
              material: 'regular',
              radius: 'md',
              className: 'p-4 text-center'
            })}>
              <p className="text-sm theme-text-primary">Regular</p>
              <p className="text-xs theme-text-muted">Main content</p>
            </div>

            <div className={GlassUI.panel({
              material: 'thick',
              radius: 'md',
              className: 'p-4 text-center'
            })}>
              <p className="text-sm theme-text-primary">Thick</p>
              <p className="text-xs theme-text-muted">Navigation & controls</p>
            </div>
          </div>
        </GlassCard>

        {/* Color Tints */}
        <GlassCard
          title="Adaptive Tints"
          subtitle="Context-aware color overlays"
          enhanced
          liquid
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Primary', variant: 'primary' },
              { name: 'Success', variant: 'success' },
              { name: 'Warning', variant: 'warning' },
              { name: 'Danger', variant: 'danger' },
              { name: 'Accent', variant: 'accent' },
              { name: 'Neutral', variant: 'neutral' }
            ].map(({ name, variant }) => (
              <div
                key={name}
                className={GlassUI.panel({
                  material: 'regular',
                  tint: variant,
                  radius: 'md',
                  className: 'p-3 text-center'
                })}
              >
                <p className="text-sm font-medium theme-text-primary">{name}</p>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard
          title="Translucent Layers"
          enhanced
          liquid
          className="text-center"
        >
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/20"></div>
            <p className="text-sm theme-text-muted">
              Glass materials show content behind them with dynamic distortion and light play.
            </p>
          </div>
        </GlassCard>

        <GlassCard
          title="Floating Controls"
          enhanced
          liquid
          className="text-center"
        >
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl shadow-float animate-float-gentle">
              <span className="text-2xl">🎛️</span>
            </div>
            <p className="text-sm theme-text-muted">
              Controls float above content as separate layers rather than opaque containers.
            </p>
          </div>
        </GlassCard>

        <GlassCard
          title="Morphing Motion"
          enhanced
          liquid
          className="text-center"
        >
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500/20 to-blue-500/20 rounded-2xl animate-liquid-morph border border-white/20"></div>
            <p className="text-sm theme-text-muted">
              Glass materials deform and transform subtly as users interact.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <PrimaryGlassButton size="lg" glow icon="🚀">
          Experience Liquid Glass
        </PrimaryGlassButton>
        <p className="text-sm theme-text-muted">
          Discover the future of interface design with Apple's 2025 Liquid Glass language
        </p>
      </div>
    </div>
  );
}