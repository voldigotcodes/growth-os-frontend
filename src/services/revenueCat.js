// RevenueCat API v2 Integration + SDK
import { Purchases } from '@revenuecat/purchases-js';

const REVENUECAT_API_BASE = 'https://api.revenuecat.com/v2';

// Use sandbox keys from environment variables
const PUBLIC_API_KEY = import.meta.env.VITE_REVENUECAT_SANDBOX_PUBLIC_KEY || 'REPLACE_WITH_PUBLIC_SANDBOX_KEY';
const SECRET_API_KEY = import.meta.env.VITE_REVENUECAT_SANDBOX_SECRET_KEY || 'REPLACE_WITH_SECRET_SANDBOX_KEY';

// Platform detection utilities
export const detectPlatform = () => {
  // Check if running in React Native environment
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // React Native detection
    if (window.ReactNativeWebView || window.webkit?.messageHandlers) {
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        return 'ios';
      } else if (/android/i.test(userAgent)) {
        return 'android';
      }
      return 'react-native';
    }

    // Mobile web detection
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return 'ios-web';
    } else if (/android/i.test(userAgent)) {
      return 'android-web';
    }
  }

  return 'web';
};

export const isNativePlatform = () => {
  const platform = detectPlatform();
  return platform === 'ios' || platform === 'android' || platform === 'react-native';
};

export const isWebPlatform = () => {
  return !isNativePlatform();
};

// Initialize RevenueCat SDK
let isInitialized = false;

export const initializeRevenueCat = async (appUserId) => {
  if (isInitialized) {
    if (appUserId) {
      await Purchases.setUserId(appUserId);
    }
    return true;
  }

  try {
    await Purchases.configure({
      apiKey: PUBLIC_API_KEY,
      appUserId: appUserId
    });
    isInitialized = true;
    console.log('🎯 RevenueCat initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat:', error);
    return false;
  }
};

// Plan configurations
export const PLANS = {
  starter: {
    id: 'growth_starter',
    name: 'Growth Starter',
    price: 'Free',
    features: [
      '10 transcription minutes',
      '5,000 TTS characters',
      '5 workflow runs',
      '10 downloads',
      '20 AI modifications',
      '100 MB storage',
      'Community support'
    ],
    credits: {
      transcription_minutes: 10,
      tts_characters: 5000,
      workflow_runs: 5,
      downloads: 10,
      ai_modifications: 20,
      storage_mb: 100
    },
    entitlement: 'growth_starter'
  },
  pro_monthly: {
    id: 'growth_pro_monthly',
    name: 'Growth Pro',
    price: '$9/month',
    features: [
      '60 transcription minutes',
      '50,000 TTS characters',
      '100 workflow runs',
      '100 downloads',
      '500 AI modifications',
      '1 GB storage',
      'Priority support',
      'Advanced voice options',
      'Workflow templates'
    ],
    credits: {
      transcription_minutes: 60,
      tts_characters: 50000,
      workflow_runs: 100,
      downloads: 100,
      ai_modifications: 500,
      storage_mb: 1000
    },
    entitlement: 'growth_pro'
  },
  pro_annual: {
    id: 'growth_pro_annual',
    name: 'Growth Pro',
    price: '$90/year',
    features: [
      '60 transcription minutes',
      '50,000 TTS characters',
      '100 workflow runs',
      '100 downloads',
      '500 AI modifications',
      '1 GB storage',
      'Priority support',
      'Advanced voice options',
      'Workflow templates',
      '2 months free'
    ],
    credits: {
      transcription_minutes: 60,
      tts_characters: 50000,
      workflow_runs: 100,
      downloads: 100,
      ai_modifications: 500,
      storage_mb: 1000
    },
    entitlement: 'growth_pro'
  },
  scaler_monthly: {
    id: 'growth_scaler_monthly',
    name: 'Growth Scaler',
    price: '$29/month',
    features: [
      '300 transcription minutes',
      '200,000 TTS characters',
      '500 workflow runs',
      '500 downloads',
      '2,000 AI modifications',
      '5 GB storage',
      'Everything in Pro',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Bulk operations'
    ],
    credits: {
      transcription_minutes: 300,
      tts_characters: 200000,
      workflow_runs: 500,
      downloads: 500,
      ai_modifications: 2000,
      storage_mb: 5000
    },
    entitlement: 'growth_scaler'
  },
  scaler_annual: {
    id: 'growth_scaler_annual',
    name: 'Growth Scaler',
    price: '$290/year',
    features: [
      '300 transcription minutes',
      '200,000 TTS characters',
      '500 workflow runs',
      '500 downloads',
      '2,000 AI modifications',
      '5 GB storage',
      'Everything in Pro',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Bulk operations',
      '2 months free'
    ],
    credits: {
      transcription_minutes: 300,
      tts_characters: 200000,
      workflow_runs: 500,
      downloads: 500,
      ai_modifications: 2000,
      storage_mb: 5000
    },
    entitlement: 'growth_scaler'
  }
};

// Get subscriber information from our backend (not RevenueCat)
export const getSubscriberInfo = async (appUserId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/credits/quota`, {
      method: 'GET',
      headers: {
        'X-User-ID': appUserId,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    const tier = data.quota.subscription_tier;

    // Convert backend tier to frontend entitlements format
    const entitlements = {};
    const activeEntitlements = [];

    switch (tier) {
      case 'starter':
        entitlements.growth_starter = {
          expires_date: null,
          product_identifier: null,
          purchase_date: new Date().toISOString()
        };
        activeEntitlements.push('growth_starter');
        break;
      case 'pro':
        entitlements.growth_pro = {
          expires_date: null, // We can add expiration logic later if needed
          product_identifier: 'growth_pro_monthly',
          purchase_date: new Date().toISOString()
        };
        activeEntitlements.push('growth_pro');
        break;
      case 'scaler':
        entitlements.growth_scaler = {
          expires_date: null,
          product_identifier: 'growth_scaler_monthly',
          purchase_date: new Date().toISOString()
        };
        activeEntitlements.push('growth_scaler');
        break;
      default:
        entitlements.growth_starter = {
          expires_date: null,
          product_identifier: null,
          purchase_date: new Date().toISOString()
        };
        activeEntitlements.push('growth_starter');
    }

    return {
      success: true,
      subscriber: {
        subscriber_id: appUserId,
        entitlements,
        subscriptions: {}, // We can populate this if needed
        active_entitlements: activeEntitlements,
        quota: data.quota,
        analytics: data.analytics
      }
    };
  } catch (error) {
    console.error('Failed to fetch subscriber info:', error);
    // Return default starter tier on error
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

// RevenueCat SDK Purchase Methods
export const purchaseProduct = async (productId) => {
  try {
    // Ensure RevenueCat is initialized
    if (!isInitialized) {
      throw new Error('RevenueCat not initialized. Call initializeRevenueCat first.');
    }

    // Get available offerings
    const offerings = await Purchases.getOfferings();

    // Find the product in the offerings
    let targetProduct = null;
    if (offerings.current) {
      for (const packageObj of offerings.current.availablePackages) {
        if (packageObj.product.identifier === productId) {
          targetProduct = packageObj;
          break;
        }
      }
    }

    if (!targetProduct) {
      throw new Error(`Product ${productId} not found in offerings`);
    }

    // Purchase the package
    const { customerInfo } = await Purchases.purchasePackage(targetProduct);

    console.log('🎉 Purchase successful:', customerInfo);

    return {
      success: true,
      customerInfo,
      productId
    };
  } catch (error) {
    console.error('❌ Purchase failed:', error);

    // Handle specific RevenueCat errors
    if (error.code) {
      switch (error.code) {
        case 'UserCancelledError':
          return {
            success: false,
            error: 'Purchase cancelled by user',
            cancelled: true
          };
        case 'NetworkError':
          return {
            success: false,
            error: 'Network error. Please check your connection and try again.'
          };
        case 'PaymentPendingError':
          return {
            success: false,
            error: 'Payment is pending. Your subscription will activate once payment is confirmed.',
            pending: true
          };
        default:
          return {
            success: false,
            error: error.message || 'Purchase failed'
          };
      }
    }

    return {
      success: false,
      error: error.message || 'Purchase failed'
    };
  }
};

// Alternative method to purchase by product ID directly
export const purchaseProductById = async (productId) => {
  try {
    if (!isInitialized) {
      throw new Error('RevenueCat not initialized. Call initializeRevenueCat first.');
    }

    const { customerInfo } = await Purchases.purchaseProduct(productId);

    console.log('🎉 Product purchase successful:', customerInfo);

    return {
      success: true,
      customerInfo,
      productId
    };
  } catch (error) {
    console.error('❌ Product purchase failed:', error);
    return {
      success: false,
      error: error.message || 'Product purchase failed'
    };
  }
};

// Get current customer info from RevenueCat SDK
export const getCustomerInfo = async () => {
  try {
    if (!isInitialized) {
      throw new Error('RevenueCat not initialized. Call initializeRevenueCat first.');
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return {
      success: true,
      customerInfo
    };
  } catch (error) {
    console.error('❌ Failed to get customer info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get available offerings
export const getOfferings = async () => {
  try {
    if (!isInitialized) {
      throw new Error('RevenueCat not initialized. Call initializeRevenueCat first.');
    }

    const offerings = await Purchases.getOfferings();
    return {
      success: true,
      offerings
    };
  } catch (error) {
    console.error('❌ Failed to get offerings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Restore purchases
export const restorePurchases = async () => {
  try {
    if (!isInitialized) {
      throw new Error('RevenueCat not initialized. Call initializeRevenueCat first.');
    }

    const { customerInfo } = await Purchases.restorePurchases();
    return {
      success: true,
      customerInfo
    };
  } catch (error) {
    console.error('❌ Failed to restore purchases:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Backend API calls for subscription management (fallback)
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

// Direct Stripe Checkout Integration (Fallback)
export const createDirectStripeCheckout = async (appUserId, productId) => {
  try {
    // Handle free tiers (Growth Starter) - no Stripe checkout needed
    if (productId === 'growth_starter_monthly' || productId === 'growth_starter_annual') {
      // Call backend to activate free tier
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': appUserId
        },
        body: JSON.stringify({
          product_id: productId,
          success_url: `${window.location.origin}/pricing?success=true&product_id=${productId}`,
          cancel_url: `${window.location.origin}/pricing?cancelled=true`
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        is_free_tier: true,
        message: data.message || 'Free tier activated successfully!'
      };
    }

    // Map paid product IDs to Stripe prices (Growth Starter is free, no Stripe needed)
    const stripePriceMap = {
      'growth_pro_monthly': 'price_pro_monthly', // Replace with your actual Stripe price IDs
      'growth_pro_annual': 'price_pro_annual',
      'growth_scaler_monthly': 'price_scaler_monthly',
      'growth_scaler_annual': 'price_scaler_annual'
    };

    const priceId = stripePriceMap[productId];
    if (!priceId) {
      throw new Error(`No Stripe price configured for product: ${productId}`);
    }

    // Call your backend to create Stripe Checkout session
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': appUserId
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: `${window.location.origin}/pricing?success=true&product_id=${productId}`,
        cancel_url: `${window.location.origin}/pricing?cancelled=true`
      })
    });

    if (!response.ok) {
      throw new Error(`Backend Stripe API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      checkout_url: data.checkout_url
    };
  } catch (error) {
    console.error('❌ Failed to create direct Stripe checkout:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Web Stripe Checkout Integration (RevenueCat)
export const createStripeCheckout = async (appUserId, productId, offeringId = 'default') => {
  try {
    // Validate API keys first
    if (!SECRET_API_KEY || SECRET_API_KEY === 'REPLACE_WITH_SECRET_SANDBOX_KEY') {
      throw new Error('RevenueCat SECRET_API_KEY not configured. Please set VITE_REVENUECAT_SANDBOX_SECRET_KEY in your .env file.');
    }

    const checkoutUrl = `${REVENUECAT_API_BASE}/subscribers/${appUserId}/offerings/${offeringId}/checkout`;
    const requestBody = {
      product_identifier: productId,
      success_url: `${window.location.origin}/pricing?success=true&product_id=${productId}`,
      cancel_url: `${window.location.origin}/pricing?cancelled=true`
    };

    console.log('🔐 Creating Stripe Checkout:', {
      url: checkoutUrl,
      appUserId,
      productId,
      offeringId,
      body: requestBody
    });

    const response = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('🔍 RevenueCat API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });

    if (!response.ok) {
      let errorMessage = `RevenueCat API error: ${response.status} ${response.statusText}`;

      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      } catch (e) {
        errorMessage += ` - ${responseText}`;
      }

      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    return {
      success: true,
      checkout_url: data.checkout_url
    };
  } catch (error) {
    console.error('❌ Failed to create Stripe checkout:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Universal purchase method that handles platform detection
export const universalPurchase = async (appUserId, productId) => {
  const platform = detectPlatform();

  console.log(`🎯 Starting purchase flow for ${productId} on ${platform}`);

  // Handle free tiers (Growth Starter) - no purchase needed
  if (productId === 'growth_starter_monthly' || productId === 'growth_starter_annual') {
    console.log('🆓 Activating free Growth Starter tier');

    try {
      const result = await createDirectStripeCheckout(appUserId, productId);
      if (result.success && result.is_free_tier) {
        return {
          success: true,
          is_free_tier: true,
          message: result.message || 'Welcome to Growth Starter! Your free plan is now active.'
        };
      } else {
        return {
          success: false,
          error: 'Failed to activate free tier'
        };
      }
    } catch (error) {
      console.error('❌ Failed to activate free tier:', error);
      return {
        success: false,
        error: error.message || 'Failed to activate free tier'
      };
    }
  }

  try {
    if (isNativePlatform()) {
      // Native platform: Use RevenueCat SDK
      console.log('📱 Using native RevenueCat SDK purchase flow');

      if (!isInitialized) {
        await initializeRevenueCat(appUserId);
      }

      return await purchaseProduct(productId);
    } else {
      // Web platform: Use Stripe Checkout
      console.log('🌐 Using web Stripe Checkout flow');

      // Try RevenueCat checkout first
      let checkoutResult = await createStripeCheckout(appUserId, productId);

      // If RevenueCat checkout fails, try direct Stripe checkout
      if (!checkoutResult.success) {
        console.log('🔄 RevenueCat checkout failed, trying direct Stripe checkout...');
        checkoutResult = await createDirectStripeCheckout(appUserId, productId);
      }

      if (checkoutResult.success) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutResult.checkout_url;

        return {
          success: true,
          redirected: true,
          message: 'Redirecting to checkout...'
        };
      } else {
        return checkoutResult;
      }
    }
  } catch (error) {
    console.error('❌ Universal purchase failed:', error);
    return {
      success: false,
      error: error.message || 'Purchase failed'
    };
  }
};

// Handle free starter plan activation
export const activateStarterPlan = async (appUserId) => {
  try {
    console.log('🆓 Activating free starter plan');

    // For starter plan, we just need to ensure the user has the basic entitlement
    // This is typically handled automatically by RevenueCat for free plans

    if (isWebPlatform()) {
      // For web, we can call our backend to set up the user
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/activate-starter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': appUserId
        },
        body: JSON.stringify({
          app_user_id: appUserId
        })
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Starter plan activated!'
        };
      }
    } else {
      // For native platforms, initialize RevenueCat which should set up basic entitlements
      await initializeRevenueCat(appUserId);
    }

    return {
      success: true,
      message: 'Starter plan activated!'
    };
  } catch (error) {
    console.error('Failed to activate starter plan:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Check URL parameters for checkout success/failure
export const checkCheckoutResult = () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('success') === 'true') {
    return {
      success: true,
      message: 'Payment successful! Your subscription is now active.'
    };
  } else if (urlParams.get('cancelled') === 'true') {
    return {
      cancelled: true,
      message: 'Payment was cancelled. You can try again anytime.'
    };
  }

  return null;
};

// Debug helper to log entitlements
export const debugEntitlements = (subscriber) => {
  if (import.meta.env.DEV) {
    console.log('🔍 RevenueCat Debug - Subscriber Info:', JSON.stringify(subscriber, null, 2));
    console.log('🎯 Active Entitlements:', subscriber?.active_entitlements);
    console.log('📦 Current Plan:', getCurrentPlan(subscriber));
    console.log('💳 Active Subscription:', getActiveSubscription(subscriber));
    console.log('🖥️ Platform:', detectPlatform());
    console.log('📱 Is Native:', isNativePlatform());
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

// Update subscription status after successful Stripe checkout
export const updateSubscriptionStatus = async (appUserId, productId, sessionId = null) => {
  try {
    console.log(`🔄 Updating subscription status for ${productId}...`);
    console.log(`👤 User ID: ${appUserId}`);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/subscription/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': appUserId
      },
      body: JSON.stringify({
        product_id: productId,
        session_id: sessionId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Subscription update failed: ${response.status} - ${errorText}`);
      throw new Error(`Subscription update failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Subscription status updated successfully:', data);

    return {
      success: true,
      subscription: data.subscription,
      quota: data.quota,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Failed to update subscription status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Debug function to manually test subscription updates (available in browser console)
export const debugUpdateSubscription = async (appUserId, productId) => {
  console.log(`🧪 Debug: Manually updating subscription for user ${appUserId} to ${productId}`);
  const result = await updateSubscriptionStatus(appUserId, productId, 'debug-session');
  if (result.success) {
    console.log('🎉 Debug update successful! Reload the page to see changes.');
  }
  return result;
};

// Make debug functions available globally for browser console
if (typeof window !== 'undefined') {
  window.debugUpdateSubscription = debugUpdateSubscription;
  window.updateSubscriptionStatus = updateSubscriptionStatus;
}