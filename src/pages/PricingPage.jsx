import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  initializeRevenueCat,
  purchaseProduct,
  purchaseProductById,
  getCustomerInfo,
  checkCheckoutResult,
  universalPurchase,
  activateStarterPlan,
  detectPlatform,
  updateSubscriptionStatus
} from '../services/revenueCat.js';

export default function PricingPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [subscriber, setSubscriber] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);

  // Load subscription data and initialize RevenueCat
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Initialize RevenueCat with user ID
        await initializeRevenueCat(currentUser.uid);

        // Check for checkout success/failure from URL params
        const checkoutResult = checkCheckoutResult();
        if (checkoutResult) {
          if (checkoutResult.success) {
            addToast(checkoutResult.message, 'success');

            // Get the product_id from URL params to know which subscription to activate
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('product_id');

            if (productId) {
              console.log(`🔄 Checkout successful for ${productId}, updating subscription status...`);
              try {
                // Update subscription status in backend
                const updateResult = await updateSubscriptionStatus(currentUser.uid, productId);
                if (updateResult.success) {
                  console.log('✅ Subscription status updated successfully:', updateResult.subscription);
                  addToast(`${updateResult.message} - Welcome to ${updateResult.subscription.tier}!`, 'success');
                } else {
                  console.error('Failed to update subscription status:', updateResult.error);
                  addToast('Subscription activated but failed to update locally. Please refresh the page.', 'warning');
                }
              } catch (error) {
                console.error('Error updating subscription status:', error);
                addToast('Subscription activated but failed to update locally. Please refresh the page.', 'warning');
              }
            }

            // Force refresh subscription data after successful payment
            console.log('🔄 Refreshing subscription data...');
            try {
              const updatedResult = await getSubscriberInfo(currentUser.uid);
              if (updatedResult.success) {
                setSubscriber(updatedResult.subscriber);
                setCurrentPlan(getCurrentPlan(updatedResult.subscriber));
                console.log('✅ Subscription data updated after successful checkout');
              }
            } catch (error) {
              console.error('Failed to refresh subscription data after checkout:', error);
            }
          } else if (checkoutResult.cancelled) {
            addToast(checkoutResult.message, 'info');
          }

          // Clean up URL params
          const url = new URL(window.location);
          url.searchParams.delete('success');
          url.searchParams.delete('cancelled');
          url.searchParams.delete('product_id');
          window.history.replaceState({}, '', url);
        }

        const result = await getSubscriberInfo(currentUser.uid);

        if (result.success) {
          setSubscriber(result.subscriber);
          setCurrentPlan(getCurrentPlan(result.subscriber));
          debugEntitlements(result.subscriber);
        } else {
          console.error('Failed to load subscription data:', result.error);
          setCurrentPlan('starter');
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        addToast('Failed to load pricing data', 'error');
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

    // Handle free starter plan activation
    if (productId === 'growth_starter') {
      setIsSubscribing(productId);
      try {
        const result = await activateStarterPlan(currentUser.uid);
        if (result.success) {
          addToast(result.message, 'success');
          // Reload subscription data
          const updatedResult = await getSubscriberInfo(currentUser.uid);
          if (updatedResult.success) {
            setSubscriber(updatedResult.subscriber);
            setCurrentPlan(getCurrentPlan(updatedResult.subscriber));
          }
        } else {
          addToast(`Failed to activate starter plan: ${result.error}`, 'error');
        }
      } catch (error) {
        console.error('Starter activation error:', error);
        addToast('Failed to activate starter plan', 'error');
      } finally {
        setIsSubscribing(null);
      }
      return;
    }

    setIsSubscribing(productId);

    try {
      const platform = detectPlatform();
      console.log(`🎯 Initiating purchase for ${productId} on ${platform}`);

      const result = await universalPurchase(currentUser.uid, productId);

      if (result.success) {
        if (result.redirected) {
          // For web - user will be redirected to Stripe Checkout
          addToast(result.message, 'info');
          // Don't reset isSubscribing as user is being redirected
          return;
        } else {
          // For native - purchase completed
          addToast('🎉 Subscription successful! Welcome to your new plan!', 'success');

          // Reload subscription data
          const updatedResult = await getSubscriberInfo(currentUser.uid);
          if (updatedResult.success) {
            setSubscriber(updatedResult.subscriber);
            setCurrentPlan(getCurrentPlan(updatedResult.subscriber));
          }
        }
      } else if (result.cancelled) {
        addToast('Purchase was cancelled', 'info');
      } else if (result.pending) {
        addToast('Payment is pending. Your subscription will activate once confirmed.', 'warning');
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

  const getPlanBadge = (planType) => {
    const isActive = currentPlan === planType ||
      (planType === 'pro' && (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual')) ||
      (planType === 'scaler' && (currentPlan === 'scaler_monthly' || currentPlan === 'scaler_annual'));

    if (isActive) {
      return (
        <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-300 mb-3">
          Current Plan
        </div>
      );
    }
    return null;
  };

  const getButtonContent = (planType) => {
    const isActive = currentPlan === planType ||
      (planType === 'pro' && (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual')) ||
      (planType === 'scaler' && (currentPlan === 'scaler_monthly' || currentPlan === 'scaler_annual'));

    if (isActive) {
      return (
        <PrimaryButton
          variant="secondary"
          className="w-full"
          onClick={() => navigate('/subscriptions')}
        >
          Manage Subscription
        </PrimaryButton>
      );
    }

    if (planType === 'starter') {
      return currentPlan !== 'starter' ? (
        <PrimaryButton
          variant="secondary"
          className="w-full"
          disabled
        >
          Downgrade (Contact Support)
        </PrimaryButton>
      ) : (
        <div className="text-center p-3 glass-panel bg-blue-500/15 border border-blue-500/20 rounded-lg">
          <span className="text-blue-300 font-medium">Free Forever</span>
        </div>
      );
    }

    // Determine product ID based on plan type and billing period
    const productId = planType === 'pro'
      ? (isAnnual ? 'growth_pro_annual' : 'growth_pro_monthly')
      : (isAnnual ? 'growth_scaler_annual' : 'growth_scaler_monthly');

    return (
      <PrimaryButton
        className="w-full"
        onClick={() => handleSubscribe(productId)}
        disabled={isSubscribing === productId}
      >
        {isSubscribing === productId ? 'Processing...' : `Start ${planType === 'pro' ? 'Pro' : 'Scaler'}`}
      </PrimaryButton>
    );
  };

  const activeSubscription = getActiveSubscription(subscriber);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-panel p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="theme-text-muted">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="text-center">
        <h1 className="text-4xl font-bold theme-text-primary mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg theme-text-muted max-w-2xl mx-auto mb-8">
          Choose the perfect plan to scale your creative advertising workflow. Start free, upgrade when you're ready.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="glass-panel p-1 bg-gray-500/10 border border-gray-400/20 rounded-full">
            <div className="flex items-center">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !isAnnual
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                  isAnnual
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Annual
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500/30 border border-emerald-400/30 rounded-full text-xs text-emerald-300">
                  40% off
                </span>
              </button>
            </div>
          </div>
        </div>

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

      {/* Pricing Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Starter Plan */}
        <GlassCard className="relative">
          <div className="p-8">
            {getPlanBadge('starter')}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold theme-text-primary">{PLANS.starter.name}</h3>
              <div className="text-4xl font-bold theme-text-primary mt-2 mb-2">{PLANS.starter.price}</div>
              <p className="theme-text-muted text-sm">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              {PLANS.starter.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm theme-text-muted">
                  <span className="text-emerald-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {getButtonContent('starter')}
          </div>
        </GlassCard>

        {/* Pro Plan */}
        <GlassCard className="relative transform scale-105 ring-2 ring-emerald-400/30">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-300">
              Most Popular
            </div>
          </div>
          <div className="p-8">
            {getPlanBadge('pro')}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold theme-text-primary">{PLANS.pro_monthly.name}</h3>
              <div className="text-4xl font-bold theme-text-primary mt-2 mb-1">
                {isAnnual ? '$290' : '$29'}
              </div>
              <p className="theme-text-muted text-sm">
                {isAnnual ? 'per year' : 'per month'}
              </p>
              {isAnnual && (
                <p className="theme-text-muted text-xs mt-1">$24/month billed annually</p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {PLANS.pro_monthly.features.slice(0, 6).map((feature, index) => (
                <li key={index} className="flex items-start text-sm theme-text-muted">
                  <span className="text-emerald-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {getButtonContent('pro')}
          </div>
        </GlassCard>

        {/* Scaler Plan */}
        <GlassCard className="relative">
          <div className="p-8">
            {getPlanBadge('scaler')}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold theme-text-primary">{PLANS.scaler_monthly.name}</h3>
              <div className="text-4xl font-bold theme-text-primary mt-2 mb-1">
                {isAnnual ? '$990' : '$99'}
              </div>
              <p className="theme-text-muted text-sm">
                {isAnnual ? 'per year' : 'per month'}
              </p>
              {isAnnual && (
                <p className="theme-text-muted text-xs mt-1">$82.50/month billed annually</p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {PLANS.scaler_monthly.features.slice(0, 6).map((feature, index) => (
                <li key={index} className="flex items-start text-sm theme-text-muted">
                  <span className="text-emerald-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {getButtonContent('scaler')}
          </div>
        </GlassCard>
      </div>

      {/* Features Comparison Section */}
      <div className="mt-16">
        <GlassCard title="Compare All Features" subtitle="See what's included in each plan">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600/30">
                  <th className="text-left py-4 theme-text-primary font-medium">Features</th>
                  <th className="text-center py-4 theme-text-primary font-medium">Starter</th>
                  <th className="text-center py-4 theme-text-primary font-medium">Pro</th>
                  <th className="text-center py-4 theme-text-primary font-medium">Scaler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600/20">
                <tr>
                  <td className="py-3 theme-text-muted">Video Downloads</td>
                  <td className="text-center py-3 theme-text-muted">5/month</td>
                  <td className="text-center py-3 text-emerald-400">Unlimited</td>
                  <td className="text-center py-3 text-emerald-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 theme-text-muted">Video Quality</td>
                  <td className="text-center py-3 theme-text-muted">720p</td>
                  <td className="text-center py-3 text-emerald-400">4K</td>
                  <td className="text-center py-3 text-emerald-400">4K</td>
                </tr>
                <tr>
                  <td className="py-3 theme-text-muted">Analytics</td>
                  <td className="text-center py-3 theme-text-muted">Basic</td>
                  <td className="text-center py-3 text-emerald-400">Advanced</td>
                  <td className="text-center py-3 text-emerald-400">Advanced</td>
                </tr>
                <tr>
                  <td className="py-3 theme-text-muted">Team Collaboration</td>
                  <td className="text-center py-3 theme-text-muted">-</td>
                  <td className="text-center py-3 text-emerald-400">✓</td>
                  <td className="text-center py-3 text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 theme-text-muted">API Access</td>
                  <td className="text-center py-3 theme-text-muted">-</td>
                  <td className="text-center py-3 theme-text-muted">-</td>
                  <td className="text-center py-3 text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 theme-text-muted">Priority Support</td>
                  <td className="text-center py-3 theme-text-muted">Community</td>
                  <td className="text-center py-3 text-emerald-400">Email</td>
                  <td className="text-center py-3 text-emerald-400">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <GlassCard title="Frequently Asked Questions" subtitle="Everything you need to know about our pricing">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium theme-text-primary mb-2">Can I change my plan anytime?</h4>
              <p className="theme-text-muted text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, and at the end of your billing cycle for downgrades.</p>
            </div>
            <div>
              <h4 className="font-medium theme-text-primary mb-2">Is there a free trial?</h4>
              <p className="theme-text-muted text-sm">Our Starter plan is completely free forever with no time limits. You can upgrade to Pro or Scaler whenever you need more features.</p>
            </div>
            <div>
              <h4 className="font-medium theme-text-primary mb-2">What payment methods do you accept?</h4>
              <p className="theme-text-muted text-sm">We accept all major credit cards, PayPal, and other payment methods through our secure payment processor.</p>
            </div>
            <div>
              <h4 className="font-medium theme-text-primary mb-2">Need a custom enterprise plan?</h4>
              <p className="theme-text-muted text-sm">
                Contact our sales team for enterprise pricing and custom features.
                <span className="text-emerald-400 ml-2 cursor-pointer hover:underline">Get in touch →</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <div className="glass-panel p-8 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-400/20">
          <h3 className="text-2xl font-bold theme-text-primary mb-4">Ready to scale your creative workflow?</h3>
          <p className="theme-text-muted mb-6 max-w-md mx-auto">
            Join thousands of creators and marketers who trust Growth OS for their advertising content.
          </p>
          <div className="flex gap-4 justify-center">
            <PrimaryButton onClick={() => navigate('/subscriptions')}>
              View All Plans
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={() => navigate('/dashboard')}>
              Start Free
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}