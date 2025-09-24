import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import GlassCard from '../components/GlassCard.jsx';

export default function PricingPage() {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const isDark = theme === 'dark';

  const [pricingTiers, setPricingTiers] = useState([]);
  const [currentTier, setCurrentTier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(null);

  const labelText = isDark ? 'text-white/80' : 'text-slate-700';
  const subtleText = isDark ? 'text-white/60' : 'text-slate-500';
  const accentPurple = isDark
    ? 'liquid-button border-purple-400/60 bg-purple-500/15 text-purple-200 hover:ring-purple-300/50'
    : 'liquid-button border-purple-200/70 bg-purple-100/80 text-purple-600 hover:ring-purple-200/60';

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setIsLoading(true);

        // Fetch pricing tiers
        const pricingResponse = await fetch('http://localhost:8000/credits/pricing', {
          method: 'GET',
        });

        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          setPricingTiers(pricingData.tiers);
        }

        // Fetch current user tier
        const quotaResponse = await fetch('http://localhost:8000/credits/quota', {
          method: 'GET',
          headers: {
            'X-User-ID': localStorage.getItem('growth-os-user-id') || `user_${Date.now()}`,
            'X-Session-ID': localStorage.getItem('growth-os-session-id') || `session_${Date.now()}`,
          },
        });

        if (quotaResponse.ok) {
          const quotaData = await quotaResponse.json();
          setCurrentTier(quotaData.quota.subscription_tier);
        }

      } catch (error) {
        console.error('Error fetching pricing data:', error);
        addToast('Failed to load pricing information', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricingData();
  }, [addToast]);

  const handleUpgrade = async (tier) => {
    if (tier === currentTier) return;

    setIsUpgrading(tier);
    try {
      const formData = new FormData();
      formData.append('tier', tier);

      const response = await fetch('http://localhost:8000/credits/upgrade', {
        method: 'POST',
        headers: {
          'X-User-ID': localStorage.getItem('growth-os-user-id') || `user_${Date.now()}`,
          'X-Session-ID': localStorage.getItem('growth-os-session-id') || `session_${Date.now()}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentTier(tier);
        addToast(`Successfully upgraded to ${tier.toUpperCase()}!`, 'success');

        // Track the upgrade
        await fetch('http://localhost:8000/analytics/track', {
          method: 'POST',
          headers: {
            'X-User-ID': localStorage.getItem('growth-os-user-id') || `user_${Date.now()}`,
            'X-Session-ID': localStorage.getItem('growth-os-session-id') || `session_${Date.now()}`,
          },
          body: new FormData(Object.entries({
            event_type: 'subscription_upgrade',
            metadata: JSON.stringify({ new_tier: tier, from_page: 'pricing' })
          }).reduce((formData, [key, value]) => {
            formData.append(key, value);
            return formData;
          }, new FormData()))
        });

      } else {
        const errorData = await response.json();
        addToast(errorData.detail || 'Failed to upgrade subscription', 'error');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      addToast('Failed to upgrade subscription', 'error');
    } finally {
      setIsUpgrading(null);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num?.toString() || '0';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${labelText}`}>Choose Your Growth Plan</h1>
          <p className={`text-lg ${subtleText} mt-2`}>Scale your content creation with the perfect plan for you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="animate-pulse">
              <div className="h-96 bg-white/5 rounded-lg"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold ${labelText}`}>Choose Your Growth Plan</h1>
        <p className={`text-lg ${subtleText} mt-2`}>Scale your content creation with the perfect plan for you</p>

        {currentTier && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full">
            <span className="text-sm font-medium">Current Plan: {currentTier.toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {pricingTiers.map((tier) => {
          const isCurrentTier = tier.tier === currentTier;
          const isUpgradingThis = isUpgrading === tier.tier;

          return (
            <GlassCard
              key={tier.tier}
              className={`relative overflow-hidden ${
                tier.popular
                  ? 'ring-2 ring-purple-500/50 bg-gradient-to-b from-purple-500/10 to-transparent'
                  : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6 mt-2">
                <h3 className={`text-xl font-bold ${labelText} mb-2`}>{tier.name}</h3>

                <div className="mb-4">
                  <span className={`text-4xl font-bold ${labelText}`}>
                    ${tier.price}
                  </span>
                  {tier.billing !== 'forever' && (
                    <span className={`text-sm ${subtleText}`}>/{tier.billing}</span>
                  )}
                </div>

                <div className={`text-sm ${subtleText} mb-6`}>
                  {tier.tier === 'free' ? 'Perfect for trying out Growth OS' :
                   tier.tier === 'starter' ? 'Ideal for solo creators' :
                   tier.tier === 'pro' ? 'Best for growing businesses' :
                   'For enterprise-level operations'}
                </div>
              </div>

              {/* Usage Limits */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${subtleText}`}>Transcription</span>
                  <span className={`text-sm font-medium ${labelText}`}>
                    {tier.limits.transcription_minutes === 9999 ? 'Unlimited' :
                     `${tier.limits.transcription_minutes} min`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${subtleText}`}>TTS Characters</span>
                  <span className={`text-sm font-medium ${labelText}`}>
                    {tier.limits.tts_characters === 9999999 ? 'Unlimited' :
                     formatNumber(tier.limits.tts_characters)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${subtleText}`}>Workflow Runs</span>
                  <span className={`text-sm font-medium ${labelText}`}>
                    {tier.limits.workflow_runs === 9999 ? 'Unlimited' :
                     `${tier.limits.workflow_runs}/month`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${subtleText}`}>Downloads</span>
                  <span className={`text-sm font-medium ${labelText}`}>
                    {tier.limits.downloads === 9999 ? 'Unlimited' :
                     `${tier.limits.downloads}/month`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${subtleText}`}>Storage</span>
                  <span className={`text-sm font-medium ${labelText}`}>
                    {tier.limits.storage_mb >= 50000 ? 'Unlimited' :
                     `${formatNumber(tier.limits.storage_mb)} MB`}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <span className={`text-sm ${subtleText}`}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="mt-auto">
                {isCurrentTier ? (
                  <div className="w-full py-3 text-center bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 font-medium">
                    Current Plan
                  </div>
                ) : tier.tier === 'free' ? (
                  <div className="w-full py-3 text-center bg-white/10 text-white/60 rounded-lg border border-white/20 font-medium">
                    Free Forever
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(tier.tier)}
                    disabled={isUpgradingThis}
                    className={`w-full py-3 text-center font-medium rounded-lg transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : accentPurple
                    } ${isUpgradingThis ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUpgradingThis ? 'Upgrading...' : `Upgrade to ${tier.name}`}
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <GlassCard>
          <h2 className={`text-2xl font-bold ${labelText} mb-6 text-center`}>Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-semibold ${labelText} mb-2`}>How do credits work?</h3>
              <p className={`text-sm ${subtleText}`}>
                Credits reset monthly and are consumed based on usage. Transcription uses 1 credit per minute,
                TTS uses 1 credit per 1000 characters, and workflow runs use 1 credit each.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold ${labelText} mb-2`}>Can I change plans anytime?</h3>
              <p className={`text-sm ${subtleText}`}>
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately
                and your remaining credits will be adjusted accordingly.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold ${labelText} mb-2`}>What happens if I exceed my limits?</h3>
              <p className={`text-sm ${subtleText}`}>
                When you reach your monthly limits, you'll be prompted to upgrade. We'll never charge you
                unexpectedly - you're always in control of your spending.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold ${labelText} mb-2`}>Do you offer refunds?</h3>
              <p className={`text-sm ${subtleText}`}>
                We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied,
                contact us and we'll provide a full refund.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}