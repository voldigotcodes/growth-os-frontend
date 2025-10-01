import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PREFERENCES: 'preferences',
  WORKFLOWS: 'workflows',
  OUTPUTS: 'outputs',
  ACTIVITY_LOGS: 'activity_logs',
  SUBSCRIPTIONS: 'subscriptions'
};

// =====================================
// USER PREFERENCES MANAGEMENT
// =====================================

export const getUserPreferences = async (uid) => {
  try {
    const prefsRef = doc(db, COLLECTIONS.USERS, uid, 'data', 'preferences');
    const docSnap = await getDoc(prefsRef);

    if (docSnap.exists()) {
      return { preferences: docSnap.data(), error: null };
    } else {
      // Return default preferences if none exist
      const defaultPrefs = {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          workflow_complete: true,
          system_updates: false
        },
        ui: {
          compactMode: false,
          showTips: true,
          autoSave: true
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          fontSize: 'medium'
        },
        backgrounds: {},
        selectedTheme: null,
        onboardingCompleted: false,
        workflowDebug: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(prefsRef, defaultPrefs);
      return { preferences: defaultPrefs, error: null };
    }
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return { preferences: null, error: error.message };
  }
};

export const updateUserPreferences = async (uid, updates) => {
  try {
    const prefsRef = doc(db, COLLECTIONS.USERS, uid, 'data', 'preferences');

    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Use setDoc with merge to create document if it doesn't exist
    await setDoc(prefsRef, updatedData, { merge: true });
    console.log('✅ Preferences updated in Firestore:', updates);
    return { error: null };
  } catch (error) {
    console.error('❌ Error updating user preferences:', error);
    return { error: error.message };
  }
};

export const resetUserPreferences = async (uid) => {
  try {
    const prefsRef = doc(db, COLLECTIONS.USERS, uid, 'data', 'preferences');
    await deleteDoc(prefsRef);

    // Recreate with defaults
    await getUserPreferences(uid);
    return { error: null };
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    return { error: error.message };
  }
};

// =====================================
// SUBSCRIPTION MANAGEMENT
// =====================================

export const getUserSubscription = async (uid) => {
  try {
    const subRef = doc(db, COLLECTIONS.USERS, uid, 'data', 'subscription');
    const docSnap = await getDoc(subRef);

    if (docSnap.exists()) {
      return { subscription: docSnap.data(), error: null };
    } else {
      // Return default subscription
      const defaultSub = {
        tier: 'starter',
        status: 'active',
        productId: null,
        customerId: null,
        subscriptionId: null,
        billingPeriod: null,
        renewalDate: null,
        entitlements: ['basic_features'],
        credits: {
          transcription_minutes: 10,
          tts_characters: 5000,
          workflow_runs: 5,
          downloads: 10,
          ai_modifications: 20,
          storage_mb: 100
        },
        usage: {
          transcription_minutes: 0,
          tts_characters: 0,
          workflow_runs: 0,
          downloads: 0,
          ai_modifications: 0,
          storage_mb: 0
        },
        lastSyncedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(subRef, defaultSub);
      return { subscription: defaultSub, error: null };
    }
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { subscription: null, error: error.message };
  }
};

export const updateUserSubscription = async (uid, updates) => {
  try {
    const subRef = doc(db, COLLECTIONS.USERS, uid, 'data', 'subscription');

    const updatedData = {
      ...updates,
      lastSyncedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Use setDoc with merge to ensure document exists
    await setDoc(subRef, updatedData, { merge: true });
    return { error: null };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return { error: error.message };
  }
};

/**
 * Sync subscription data from backend to Firestore
 * This ensures real-time listeners pick up subscription changes from Stripe/RevenueCat
 */
export const syncSubscriptionFromBackend = async (uid, apiBaseUrl = 'http://localhost:8000') => {
  try {
    // Import auth to get ID token (avoid circular dependency by importing here)
    const { auth } = await import('./firebaseConfig.js');
    const user = auth.currentUser;

    if (!user) {
      return { error: 'No authenticated user' };
    }

    const idToken = await user.getIdToken();

    // Fetch latest subscription data from backend
    const response = await fetch(`${apiBaseUrl}/credits/quota`, {
      method: 'GET',
      headers: {
        'X-User-ID': uid,
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription from backend: ${response.status}`);
    }

    const quotaData = await response.json();
    const { quota } = quotaData;

    // Map backend quota data to Firestore subscription format
    const subscriptionData = {
      tier: quota.subscription_tier || 'starter',
      status: 'active', // Backend should provide this
      productId: null, // Backend should provide this if available
      customerId: quota.stripe_customer_id || null,
      subscriptionId: quota.stripe_subscription_id || null,
      billingPeriod: quota.billing_period || null,
      renewalDate: quota.current_period_end || null,
      entitlements: quota.entitlements || ['basic_features'],
      credits: {
        transcription_minutes: quota.transcription_minutes,
        tts_characters: quota.tts_characters,
        workflow_runs: quota.workflow_runs,
        downloads: quota.downloads,
        ai_modifications: quota.ai_modifications,
        storage_mb: quota.storage_mb
      },
      usage: {
        transcription_minutes: quota.usage?.transcription_minutes || 0,
        tts_characters: quota.usage?.tts_characters || 0,
        workflow_runs: quota.usage?.workflow_runs || 0,
        downloads: quota.usage?.downloads || 0,
        ai_modifications: quota.usage?.ai_modifications || 0,
        storage_mb: quota.usage?.storage_mb || 0
      }
    };

    // Update Firestore with backend data
    const result = await updateUserSubscription(uid, subscriptionData);

    if (result.error) {
      return { synced: false, error: result.error };
    }

    console.log('✅ Subscription synced from backend to Firestore:', subscriptionData.tier);
    return { synced: true, subscription: subscriptionData, error: null };
  } catch (error) {
    console.error('❌ Error syncing subscription from backend:', error);
    return { synced: false, error: error.message };
  }
};

// =====================================
// WORKFLOW MANAGEMENT
// =====================================

export const saveWorkflow = async (uid, workflowData) => {
  try {
    const workflowId = workflowData.id || `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const workflowRef = doc(db, COLLECTIONS.USERS, uid, 'workflows', workflowId);

    const workflow = {
      id: workflowId,
      name: workflowData.name || 'Untitled Workflow',
      description: workflowData.description || '',
      nodes: workflowData.nodes || [],
      edges: workflowData.edges || [],
      settings: workflowData.settings || {},
      metadata: {
        version: '1.0',
        tags: workflowData.tags || [],
        category: workflowData.category || 'general',
        isTemplate: workflowData.isTemplate || false,
        isPublic: workflowData.isPublic || false
      },
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        lastRunAt: null,
        avgExecutionTime: 0
      },
      createdAt: workflowData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(workflowRef, workflow);
    return { workflowId, error: null };
  } catch (error) {
    console.error('Error saving workflow:', error);
    return { workflowId: null, error: error.message };
  }
};

export const getUserWorkflows = async (uid) => {
  try {
    const workflowsRef = collection(db, COLLECTIONS.USERS, uid, 'workflows');
    const q = query(workflowsRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const workflows = [];
    querySnapshot.forEach((doc) => {
      workflows.push({ id: doc.id, ...doc.data() });
    });

    return { workflows, error: null };
  } catch (error) {
    console.error('Error getting user workflows:', error);
    return { workflows: [], error: error.message };
  }
};

export const deleteWorkflow = async (uid, workflowId) => {
  try {
    const workflowRef = doc(db, COLLECTIONS.USERS, uid, 'workflows', workflowId);
    await deleteDoc(workflowRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return { error: error.message };
  }
};

// =====================================
// OUTPUT MANAGEMENT
// =====================================

export const saveOutput = async (uid, outputData) => {
  try {
    const outputId = outputData.id || `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outputRef = doc(db, COLLECTIONS.USERS, uid, 'outputs', outputId);

    const output = {
      id: outputId,
      workflowId: outputData.workflowId,
      workflowName: outputData.workflowName || 'Unknown Workflow',
      type: outputData.type, // 'text', 'audio', 'video', 'file'
      content: outputData.content,
      metadata: {
        format: outputData.format,
        size: outputData.size,
        duration: outputData.duration,
        quality: outputData.quality,
        processing_time: outputData.processing_time
      },
      files: outputData.files || [], // Array of file URLs/paths
      downloadCount: 0,
      lastDownloadedAt: null,
      tags: outputData.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(outputRef, output);
    return { outputId, error: null };
  } catch (error) {
    console.error('Error saving output:', error);
    return { outputId: null, error: error.message };
  }
};

export const getUserOutputs = async (uid, workflowId = null) => {
  try {
    const outputsRef = collection(db, COLLECTIONS.USERS, uid, 'outputs');
    let q;

    if (workflowId) {
      q = query(outputsRef, where('workflowId', '==', workflowId), orderBy('createdAt', 'desc'));
    } else {
      q = query(outputsRef, orderBy('createdAt', 'desc'), limit(50));
    }

    const querySnapshot = await getDocs(q);

    const outputs = [];
    querySnapshot.forEach((doc) => {
      outputs.push({ id: doc.id, ...doc.data() });
    });

    return { outputs, error: null };
  } catch (error) {
    console.error('Error getting user outputs:', error);
    return { outputs: [], error: error.message };
  }
};

export const updateOutputDownload = async (uid, outputId) => {
  try {
    const outputRef = doc(db, COLLECTIONS.USERS, uid, 'outputs', outputId);
    await updateDoc(outputRef, {
      downloadCount: serverTimestamp(),
      lastDownloadedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Error updating output download:', error);
    return { error: error.message };
  }
};

// =====================================
// ACTIVITY LOGGING
// =====================================

export const logActivity = async (uid, activityData) => {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const logRef = doc(db, COLLECTIONS.USERS, uid, 'activity_logs', logId);

    const activity = {
      id: logId,
      type: activityData.type, // 'transcription', 'tts', 'workflow_run', 'download', etc.
      action: activityData.action, // 'start', 'complete', 'error', 'cancel'
      workflowId: activityData.workflowId || null,
      resourceId: activityData.resourceId || null,
      metadata: {
        duration: activityData.duration,
        inputSize: activityData.inputSize,
        outputSize: activityData.outputSize,
        quality: activityData.quality,
        format: activityData.format,
        errors: activityData.errors || []
      },
      result: activityData.result || null,
      sessionId: activityData.sessionId || null,
      timestamp: serverTimestamp()
    };

    await setDoc(logRef, activity);
    return { logId, error: null };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { logId: null, error: error.message };
  }
};

export const getUserActivityLogs = async (uid, type = null, limitCount = 100) => {
  try {
    const logsRef = collection(db, COLLECTIONS.USERS, uid, 'activity_logs');
    let q;

    if (type) {
      q = query(logsRef, where('type', '==', type), orderBy('timestamp', 'desc'), limit(limitCount));
    } else {
      q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    }

    const querySnapshot = await getDocs(q);

    const logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    return { logs, error: null };
  } catch (error) {
    console.error('Error getting user activity logs:', error);
    return { logs: [], error: error.message };
  }
};

// =====================================
// REAL-TIME LISTENERS
// =====================================

export const subscribeToUserPreferences = (uid, callback) => {
  const prefsRef = doc(db, COLLECTIONS.USERS, uid, 'data', 'preferences');
  return onSnapshot(prefsRef, (doc) => {
    if (doc.exists()) {
      callback({ preferences: doc.data(), error: null });
    } else {
      callback({ preferences: null, error: 'Preferences not found' });
    }
  }, (error) => {
    callback({ preferences: null, error: error.message });
  });
};

export const subscribeToUserSubscription = (uid, callback) => {
  const subRef = doc(db, COLLECTIONS.USERS, uid, 'data', 'subscription');
  return onSnapshot(subRef, (doc) => {
    if (doc.exists()) {
      callback({ subscription: doc.data(), error: null });
    } else {
      callback({ subscription: null, error: 'Subscription not found' });
    }
  }, (error) => {
    callback({ subscription: null, error: error.message });
  });
};

export const subscribeToUserWorkflows = (uid, callback) => {
  const workflowsRef = collection(db, COLLECTIONS.USERS, uid, 'workflows');
  const q = query(workflowsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const workflows = [];
    querySnapshot.forEach((doc) => {
      workflows.push({ id: doc.id, ...doc.data() });
    });
    callback({ workflows, error: null });
  }, (error) => {
    callback({ workflows: [], error: error.message });
  });
};

// =====================================
// BATCH OPERATIONS
// =====================================

export const migrateLocalStorageToFirestore = async (uid, localStorageData) => {
  try {
    const batch = [];

    // Migrate preferences
    if (localStorageData.preferences) {
      batch.push(updateUserPreferences(uid, localStorageData.preferences));
    }

    // Migrate theme settings
    if (localStorageData.backgrounds || localStorageData.selectedTheme) {
      const themeUpdates = {};
      if (localStorageData.backgrounds) themeUpdates.backgrounds = localStorageData.backgrounds;
      if (localStorageData.selectedTheme) themeUpdates.selectedTheme = localStorageData.selectedTheme;
      batch.push(updateUserPreferences(uid, themeUpdates));
    }

    // Migrate onboarding status
    if (localStorageData.onboardingCompleted !== undefined) {
      batch.push(updateUserPreferences(uid, {
        onboardingCompleted: localStorageData.onboardingCompleted
      }));
    }

    // Execute all migrations
    await Promise.all(batch);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error migrating localStorage to Firestore:', error);
    return { success: false, error: error.message };
  }
};