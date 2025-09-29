// RevenueCat API v2 Integration
const REVENUECAT_API_BASE = 'https://api.revenuecat.com/v2';

// Use sandbox keys from environment variables
const PUBLIC_API_KEY = import.meta.env.REVENUECAT_SANDBOX_PUBLIC_KEY || 'REPLACE_WITH_PUBLIC_SANDBOX_KEY';
const SECRET_API_KEY = import.meta.env.REVENUECAT_SANDBOX_SECRET_KEY || 'REPLACE_WITH_SECRET_SANDBOX_KEY';

// Plan configurations
export const PLANS = {
  starter: {
    id: 'growth_starter',
    name: 'Growth Starter',
    price: 'Free',
    features: [
      '5 video downloads per month',
      'Basic analytics',
      'Community support',
      '720p video quality'
    ],
    entitlement: 'growth_starter'
  },
  pro_monthly: {
    id: 'growth_pro_monthly',
    name: 'Growth Pro',
    price: '$29/month',
    features: [
      'Unlimited video downloads',
      'Advanced analytics',
      'Priority support',
      '4K video quality',
      'Custom branding',
      'Team collaboration'
    ],
    entitlement: 'growth_pro'
  },
  pro_annual: {
    id: 'growth_pro_annual',
    name: 'Growth Pro',
    price: '$290/year',
    features: [
      'Unlimited video downloads',
      'Advanced analytics',
      'Priority support',
      '4K video quality',
      'Custom branding',
      'Team collaboration',
      '2 months free'
    ],
    entitlement: 'growth_pro'
  },
  scaler_monthly: {
    id: 'growth_scaler_monthly',
    name: 'Growth Scaler',
    price: '$99/month',
    features: [
      'Everything in Pro',
      'API access',
      'Bulk operations',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations'
    ],
    entitlement: 'growth_scaler'
  },
  scaler_annual: {
    id: 'growth_scaler_annual',
    name: 'Growth Scaler',
    price: '$990/year',
    features: [
      'Everything in Pro',
      'API access',
      'Bulk operations',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      '2 months free'
    ],
    entitlement: 'growth_scaler'
  }
};

// Get subscriber information using RevenueCat API v2
export const getSubscriberInfo = async (appUserId) => {
  try {
    const response = await fetch(`${REVENUECAT_API_BASE}/subscribers/${appUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PUBLIC_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Subscriber doesn't exist, return starter entitlements
        return {
          success: true,
          subscriber: {
            subscriber_id: appUserId,
            entitlements: {
              growth_starter: {
                expires_date: null,
                product_identifier: null,
                purchase_date: new Date().toISOString()
              }
            },
            subscriptions: {},
            active_entitlements: ['growth_starter']
          }
        };
      }
      throw new Error(`RevenueCat API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse entitlements to determine active plan
    const entitlements = data.subscriber?.entitlements || {};
    const activeEntitlements = Object.keys(entitlements).filter(key => {
      const entitlement = entitlements[key];
      return !entitlement.expires_date || new Date(entitlement.expires_date) > new Date();
    });

    return {
      success: true,
      subscriber: {
        ...data.subscriber,
        active_entitlements: activeEntitlements.length > 0 ? activeEntitlements : ['growth_starter']
      }
    };
  } catch (error) {
    console.error('Failed to fetch subscriber info:', error);
    return {
      success: false,
      error: error.message,
      subscriber: null
    };
  }
};

// Determine user's current plan based on entitlements
export const getCurrentPlan = (subscriber) => {
  if (!subscriber || !subscriber.active_entitlements) {
    return 'starter';
  }

  const entitlements = subscriber.active_entitlements;

  if (entitlements.includes('growth_scaler')) {
    return 'scaler';
  } else if (entitlements.includes('growth_pro')) {
    return 'pro';
  } else {
    return 'starter';
  }
};

// Get active subscription details
export const getActiveSubscription = (subscriber) => {
  if (!subscriber || !subscriber.subscriptions) {
    return null;
  }

  const subscriptions = subscriber.subscriptions;

  // Find active subscription
  for (const productId in subscriptions) {
    const subscription = subscriptions[productId];
    if (!subscription.expires_date || new Date(subscription.expires_date) > new Date()) {
      return {
        productId,
        ...subscription,
        isActive: true,
        isAnnual: productId.includes('annual')
      };
    }
  }

  return null;
};

// Backend API calls for subscription management
export const subscribeToProduct = async (appUserId, productId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': appUserId
      },
      body: JSON.stringify({
        product_id: productId,
        app_user_id: appUserId
      })
    });

    if (!response.ok) {
      throw new Error(`Subscription API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Failed to subscribe to product:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Debug helper to log entitlements
export const debugEntitlements = (subscriber) => {
  if (import.meta.env.DEV) {
    console.log('🔍 RevenueCat Debug - Subscriber Info:', JSON.stringify(subscriber, null, 2));
    console.log('🎯 Active Entitlements:', subscriber?.active_entitlements);
    console.log('📦 Current Plan:', getCurrentPlan(subscriber));
    console.log('💳 Active Subscription:', getActiveSubscription(subscriber));
  }
};

// Mock sandbox data for testing
export const createMockSubscriber = (plan = 'starter') => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const entitlements = {};
  const subscriptions = {};

  switch (plan) {
    case 'pro':
      entitlements.growth_pro = {
        expires_date: futureDate.toISOString(),
        product_identifier: 'growth_pro_monthly',
        purchase_date: now.toISOString()
      };
      subscriptions.growth_pro_monthly = {
        expires_date: futureDate.toISOString(),
        purchase_date: now.toISOString(),
        period_type: 'normal'
      };
      break;
    case 'scaler':
      entitlements.growth_scaler = {
        expires_date: futureDate.toISOString(),
        product_identifier: 'growth_scaler_monthly',
        purchase_date: now.toISOString()
      };
      subscriptions.growth_scaler_monthly = {
        expires_date: futureDate.toISOString(),
        purchase_date: now.toISOString(),
        period_type: 'normal'
      };
      break;
    default:
      entitlements.growth_starter = {
        expires_date: null,
        product_identifier: null,
        purchase_date: now.toISOString()
      };
  }

  return {
    subscriber_id: 'sandbox_user_123',
    entitlements,
    subscriptions,
    active_entitlements: Object.keys(entitlements)
  };
};