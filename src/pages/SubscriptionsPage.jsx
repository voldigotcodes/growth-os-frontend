import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import GlassCard from '../components/GlassCard.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import {
  PLANS,
  getSubscriberInfo,
  getCurrentPlan,
  getActiveSubscription,
  subscribeToProduct,
  debugEntitlements,
  createMockSubscriber
} from '../services/revenueCat.js';

export default function SubscriptionsPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [subscriber, setSubscriber] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(null);

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Use Firebase UID as app user ID for RevenueCat
        const appUserId = currentUser.uid;
        const result = await getSubscriberInfo(appUserId);

        if (result.success) {
          setSubscriber(result.subscriber);
          setCurrentPlan(getCurrentPlan(result.subscriber));
          debugEntitlements(result.subscriber);
        } else {
          console.error('Failed to load subscription data:', result.error);
          // Fallback to starter plan
          const mockSubscriber = createMockSubscriber('starter');
          setSubscriber(mockSubscriber);
          setCurrentPlan('starter');
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        addToast('Failed to load subscription data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionData();
  }, [currentUser, addToast]);

  const handleSubscribe = async (productId) => {
    if (!currentUser) {
      addToast('Please log in to subscribe', 'error');
      return;
    }

    setIsSubscribing(productId);

    try {
      const result = await subscribeToProduct(currentUser.uid, productId);

      if (result.success) {
        addToast('Subscription initiated! Check your email for payment details.', 'success');

        // Reload subscription data
        const updatedResult = await getSubscriberInfo(currentUser.uid);
        if (updatedResult.success) {
          setSubscriber(updatedResult.subscriber);
          setCurrentPlan(getCurrentPlan(updatedResult.subscriber));
        }
      } else {
        addToast(`Subscription failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      addToast('Subscription failed. Please try again.', 'error');
    } finally {
      setIsSubscribing(null);
    }
  };

  const getPlanCardStyle = (planType) => {
    const isActive = currentPlan === planType ||
      (planType === 'pro' && (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual')) ||
      (planType === 'scaler' && (currentPlan === 'scaler_monthly' || currentPlan === 'scaler_annual'));

    if (isActive) {
      return isDark
        ? 'glass-panel border-emerald-400/60 bg-emerald-500/15 ring-2 ring-emerald-400/30'
        : 'glass-panel border-emerald-200/70 bg-emerald-100/80 ring-2 ring-emerald-200/60';
    }

    return isDark
      ? 'glass-panel border-gray-400/30 bg-gray-500/10 hover:border-gray-300/50'
      : 'glass-panel border-gray-200/50 bg-white/60 hover:border-gray-300/70';
  };

  const activeSubscription = getActiveSubscription(subscriber);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-panel p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="theme-text-muted">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <header className="text-center">
        <h1 className="text-4xl font-bold theme-text-primary mb-4">Choose Your Growth Plan</h1>
        <p className="text-lg theme-text-muted max-w-2xl mx-auto">
          Scale your creative advertising workflow with powerful tools and unlimited possibilities.
        </p>

        {currentPlan !== 'starter' && activeSubscription && (
          <div className="mt-6 glass-panel p-4 bg-emerald-500/10 border border-emerald-500/20 max-w-md mx-auto">
            <p className="text-emerald-300 font-medium">✨ {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan Active</p>
            <p className="theme-text-muted text-sm mt-1">
              {activeSubscription.expires_date
                ? `Renews ${new Date(activeSubscription.expires_date).toLocaleDateString()}`
                : 'Active subscription'
              }
            </p>
          </div>
        )}
      </header>

      {/* Plan Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Starter Plan */}
        <div className={getPlanCardStyle('starter')}>
          <div className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold theme-text-primary">{PLANS.starter.name}</h3>
              <div className="text-3xl font-bold theme-text-primary mt-2">{PLANS.starter.price}</div>
              <p className="theme-text-muted text-sm mt-1">Perfect for getting started</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PLANS.starter.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm theme-text-muted">
                  <span className="text-emerald-400 mr-3">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {currentPlan === 'starter' ? (
              <div className="text-center p-3 glass-panel bg-emerald-500/15 border border-emerald-500/20 rounded-lg">
                <span className="text-emerald-300 font-medium">Current Plan</span>
              </div>
            ) : (
              <PrimaryButton
                variant="secondary"
                className="w-full"
                disabled
              >
                Downgrade (Contact Support)
              </PrimaryButton>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div className={getPlanCardStyle('pro') + ' transform scale-105'}>
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-300 mb-3">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold theme-text-primary">{PLANS.pro_monthly.name}</h3>
              <div className="text-3xl font-bold theme-text-primary mt-2">
                {PLANS.pro_monthly.price}
                <span className="text-lg theme-text-muted">/{PLANS.pro_annual.price}</span>
              </div>
              <p className="theme-text-muted text-sm mt-1">Monthly / Annual billing</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PLANS.pro_monthly.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm theme-text-muted">
                  <span className="text-emerald-400 mr-3">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {currentPlan === 'pro' ? (
              <div className="text-center p-3 glass-panel bg-emerald-500/15 border border-emerald-500/20 rounded-lg">
                <span className="text-emerald-300 font-medium">Current Plan</span>
              </div>
            ) : (
              <div className="space-y-3">
                <PrimaryButton
                  className="w-full"
                  onClick={() => handleSubscribe('growth_pro_monthly')}
                  disabled={isSubscribing}
                >
                  {isSubscribing === 'growth_pro_monthly' ? 'Processing...' : 'Start Monthly ($29)'}
                </PrimaryButton>
                <PrimaryButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleSubscribe('growth_pro_annual')}
                  disabled={isSubscribing}
                >
                  {isSubscribing === 'growth_pro_annual' ? 'Processing...' : 'Start Annual ($290)'}
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>

        {/* Scaler Plan */}
        <div className={getPlanCardStyle('scaler')}>
          <div className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold theme-text-primary">{PLANS.scaler_monthly.name}</h3>
              <div className="text-3xl font-bold theme-text-primary mt-2">
                {PLANS.scaler_monthly.price}
                <span className="text-lg theme-text-muted">/{PLANS.scaler_annual.price}</span>
              </div>
              <p className="theme-text-muted text-sm mt-1">Enterprise-grade features</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PLANS.scaler_monthly.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm theme-text-muted">
                  <span className="text-emerald-400 mr-3">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {currentPlan === 'scaler' ? (
              <div className="text-center p-3 glass-panel bg-emerald-500/15 border border-emerald-500/20 rounded-lg">
                <span className="text-emerald-300 font-medium">Current Plan</span>
              </div>
            ) : (
              <div className="space-y-3">
                <PrimaryButton
                  className="w-full"
                  onClick={() => handleSubscribe('growth_scaler_monthly')}
                  disabled={isSubscribing}
                >
                  {isSubscribing === 'growth_scaler_monthly' ? 'Processing...' : 'Start Monthly ($99)'}
                </PrimaryButton>
                <PrimaryButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleSubscribe('growth_scaler_annual')}
                  disabled={isSubscribing}
                >
                  {isSubscribing === 'growth_scaler_annual' ? 'Processing...' : 'Start Annual ($990)'}
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {import.meta.env.DEV && subscriber && (
        <div className="mt-8">
          <GlassCard title="Debug Info" subtitle="RevenueCat integration details (dev only)">
            <div className="space-y-2 text-sm">
              <p><strong>App User ID:</strong> {currentUser?.uid}</p>
              <p><strong>Current Plan:</strong> {currentPlan}</p>
              <p><strong>Active Entitlements:</strong> {subscriber.active_entitlements?.join(', ') || 'None'}</p>
              <p><strong>Active Subscription:</strong> {activeSubscription?.productId || 'None'}</p>
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Raw Subscriber Data</summary>
                <pre className="mt-2 p-3 bg-black/20 rounded text-xs overflow-auto">
                  {JSON.stringify(subscriber, null, 2)}
                </pre>
              </details>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}