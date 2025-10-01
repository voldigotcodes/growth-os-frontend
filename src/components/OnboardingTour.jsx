import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../firebase/AuthContext.jsx';
import { trackEvent } from '../lib/apiClientFirebase.js';
import { updateUserPreferences } from '../firebase/firestoreService.js';
import GlassCard from './GlassCard.jsx';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: '🚀 Welcome to Growth OS!',
    description: 'Your AI-powered content creation studio is ready. Let\'s get you set up for success!',
    action: 'Start Your Journey',
    reward: { type: 'points', value: 10 },
    page: null
  },
  {
    id: 'dashboard',
    title: '📊 Meet Your Dashboard',
    description: 'Track your creative progress, engagement score, and achievements in one beautiful view.',
    action: 'Explore Dashboard',
    reward: { type: 'points', value: 15 },
    page: '/dashboard'
  },
  {
    id: 'first-download',
    title: '🗂️ Download Your First Video',
    description: 'Start by collecting inspiration from competitor ads. Paste any video URL to begin!',
    action: 'Go to Inspiration Vault',
    reward: { type: 'bonus_credits', value: { downloads: 5 } },
    page: '/download'
  },
  {
    id: 'transcribe-content',
    title: '✏️ Turn Audio into Gold',
    description: 'Transform video audio into polished ad scripts using our AI transcription and refinement.',
    action: 'Try Script Refinery',
    reward: { type: 'bonus_credits', value: { transcription_minutes: 10 } },
    page: '/transcribe'
  },
  {
    id: 'generate-voice',
    title: '🎧 Create Professional Voiceovers',
    description: 'Generate natural-sounding voiceovers with premium AI voices in seconds.',
    action: 'Visit Voice Studio',
    reward: { type: 'bonus_credits', value: { tts_characters: 2000 } },
    page: '/tts'
  },
  {
    id: 'build-workflow',
    title: '⚡ Automate Your Process',
    description: 'Connect tools into powerful workflows that run your entire creation pipeline automatically.',
    action: 'Build First Workflow',
    reward: { type: 'bonus_credits', value: { workflow_runs: 10 } },
    page: '/workflows'
  },
  {
    id: 'completion',
    title: '🎉 You\'re All Set!',
    description: 'Congratulations! You\'ve unlocked the full potential of Growth OS. Your bonus credits have been added!',
    action: 'Start Creating',
    reward: { type: 'achievement', value: 'Onboarding Master' },
    page: '/dashboard'
  }
];

export default function OnboardingTour({ onComplete }) {
  const { theme } = useTheme();
  const { currentUser, userPreferences } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use standard theme text classes for proper contrast
  const labelText = 'theme-text-primary';
  const subtleText = 'theme-text-muted';
  const accentGradient = 'bg-gradient-to-r from-purple-500 to-pink-500';

  // Initial check when component mounts
  useEffect(() => {
    if (!hasCheckedOnboarding && currentUser && userPreferences !== null && userPreferences !== undefined) {
      const hasCompletedOnboarding = userPreferences.onboardingCompleted || false;
      console.log('🔍 Initial onboarding status check:', {
        hasCompletedOnboarding,
        userId: currentUser.uid,
        preferencesLoaded: !!userPreferences
      });

      setHasCheckedOnboarding(true);

      if (!hasCompletedOnboarding) {
        console.log('✅ Starting onboarding - user has not completed it yet');
        setIsVisible(true);
        trackEvent('onboarding_started');
      } else {
        console.log('⏭️ Onboarding already completed, skipping');
        setIsVisible(false);
      }
    }
  }, [currentUser, userPreferences, hasCheckedOnboarding]);

  // Watch for onboardingCompleted changes and hide if it becomes true
  useEffect(() => {
    if (userPreferences?.onboardingCompleted === true && isVisible) {
      console.log('🔔 Onboarding was marked complete in Firestore, hiding widget');
      setIsVisible(false);
    }
  }, [userPreferences?.onboardingCompleted, isVisible]);

  const handleStepAction = async () => {
    const step = ONBOARDING_STEPS[currentStep];

    setIsAnimating(true);

    // Award points/rewards
    if (step.reward) {
      if (step.reward.type === 'points') {
        setEarnedPoints(prev => prev + step.reward.value);
      } else if (step.reward.type === 'bonus_credits') {
        setEarnedRewards(prev => [...prev, step.reward.value]);
      } else if (step.reward.type === 'achievement') {
        setEarnedRewards(prev => [...prev, { achievement: step.reward.value }]);
      }
    }

    // Track completion of this step
    await trackEvent('onboarding_step_completed', {
      step_id: step.id,
      step_number: currentStep + 1,
      total_steps: ONBOARDING_STEPS.length
    });

    // Small delay for animation
    setTimeout(() => {
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);

        // Navigate to the step's page if specified
        if (step.page) {
          navigate(step.page);
        }
      } else {
        // Complete onboarding
        completeOnboarding();
      }
      setIsAnimating(false);
    }, 1000);
  };

  const completeOnboarding = async () => {
    console.log('🎉 Completing onboarding...');

    // Mark onboarding as completed in Firestore
    if (currentUser) {
      try {
        console.log('💾 Saving onboardingCompleted=true to Firestore for user:', currentUser.uid);
        const result = await updateUserPreferences(currentUser.uid, {
          onboardingCompleted: true
        });

        if (result.error) {
          console.error('❌ Firestore update failed:', result.error);
        } else {
          console.log('✅ Onboarding completion saved to Firestore successfully');
        }
      } catch (error) {
        console.error('❌ Exception during Firestore update:', error);
      }
    } else {
      console.error('❌ No currentUser available to save onboarding status');
    }

    // Award all bonus credits
    if (earnedRewards.length > 0) {
      try {
        const allBonusCredits = earnedRewards.reduce((acc, reward) => {
          if (reward.achievement) return acc;
          return {
            transcription_minutes: (acc.transcription_minutes || 0) + (reward.transcription_minutes || 0),
            tts_characters: (acc.tts_characters || 0) + (reward.tts_characters || 0),
            workflow_runs: (acc.workflow_runs || 0) + (reward.workflow_runs || 0),
            downloads: (acc.downloads || 0) + (reward.downloads || 0)
          };
        }, {});

        const formData = new FormData();
        Object.entries(allBonusCredits).forEach(([key, value]) => {
          if (value > 0) formData.append(key, value.toString());
        });

        // Use Firebase auth headers
        const headers = {};
        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${idToken}`;
            headers['X-User-ID'] = currentUser.uid;
          } catch (error) {
            console.warn('Failed to get auth token for bonus credits:', error);
            headers['X-User-ID'] = currentUser.uid;
          }
        }

        await fetch('/api/credits/bonus', {
          method: 'POST',
          headers,
          body: formData
        });
      } catch (error) {
        console.warn('Failed to award bonus credits:', error);
      }
    }

    await trackEvent('onboarding_completed', {
      total_steps: ONBOARDING_STEPS.length,
      points_earned: earnedPoints,
      rewards_earned: earnedRewards.length
    });

    console.log('🚀 Closing onboarding widget...');
    setIsVisible(false);
    setHasCheckedOnboarding(true); // Ensure it won't show again

    if (onComplete) {
      onComplete();
    }

    console.log('✨ Onboarding complete!');
  };

  const skipOnboarding = async () => {
    console.log('⏭️ Skipping onboarding...');

    await trackEvent('onboarding_skipped', {
      skipped_at_step: currentStep + 1,
      total_steps: ONBOARDING_STEPS.length
    });

    // Mark onboarding as completed in Firestore
    if (currentUser) {
      try {
        console.log('💾 Saving onboardingCompleted=true (skip) to Firestore for user:', currentUser.uid);
        const result = await updateUserPreferences(currentUser.uid, {
          onboardingCompleted: true
        });

        if (result.error) {
          console.error('❌ Firestore update failed:', result.error);
        } else {
          console.log('✅ Onboarding skip status saved to Firestore successfully');
        }
      } catch (error) {
        console.error('❌ Exception during Firestore update:', error);
      }
    } else {
      console.error('❌ No currentUser available to save skip status');
    }

    setIsVisible(false);
    setHasCheckedOnboarding(true);

    if (onComplete) {
      onComplete();
    }

    console.log('✨ Onboarding skipped and closed');
  };

  const dismissOnboarding = async () => {
    console.log('✕ Dismissing onboarding...');

    await trackEvent('onboarding_dismissed', {
      dismissed_at_step: currentStep + 1,
      total_steps: ONBOARDING_STEPS.length
    });

    // Mark onboarding as completed in Firestore so it won't show again
    if (currentUser) {
      try {
        console.log('💾 Saving onboardingCompleted=true (dismiss) to Firestore for user:', currentUser.uid);
        const result = await updateUserPreferences(currentUser.uid, {
          onboardingCompleted: true
        });

        if (result.error) {
          console.error('❌ Firestore update failed:', result.error);
        } else {
          console.log('✅ Onboarding dismissed and saved to Firestore successfully');
        }
      } catch (error) {
        console.error('❌ Exception during Firestore update:', error);
      }
    } else {
      console.error('❌ No currentUser available to save dismiss status');
    }

    setIsVisible(false);
    setHasCheckedOnboarding(true);

    if (onComplete) {
      onComplete();
    }

    console.log('✨ Onboarding dismissed and closed');
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-16' : 'w-96 max-w-[calc(100vw-3rem)]'
    }`}>
      <GlassCard className={`relative shadow-2xl border border-white/20 ${isMinimized ? 'overflow-hidden' : ''}`}>
        {isMinimized ? (
          /* Minimized State - Compact Icon */
          <div className="p-3">
            <button
              onClick={() => setIsMinimized(false)}
              className="w-full flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform"
              title="Expand Onboarding"
            >
              <div className="text-2xl animate-bounce">🚀</div>
              <div className="w-full bg-white/10 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all ${accentGradient}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-gray-400">{currentStep + 1}/{ONBOARDING_STEPS.length}</div>
            </button>
            <button
              onClick={dismissOnboarding}
              className="absolute top-1 right-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            {/* Header with Controls */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="text-xs text-gray-400">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className={`text-xs ${subtleText} hover:text-current transition-colors px-2 py-1 rounded hover:bg-white/5`}
                  title="Minimize"
                >
                  ↙
                </button>
                <button
                  onClick={skipOnboarding}
                  className={`text-xs ${subtleText} hover:text-current transition-colors px-2 py-1 rounded hover:bg-white/5`}
                  title="Skip onboarding"
                >
                  Skip
                </button>
                <button
                  onClick={dismissOnboarding}
                  className={`text-xs ${subtleText} hover:text-current transition-colors px-2 py-1 rounded hover:bg-white/5`}
                  title="Close and don't show again"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${subtleText}`}>Progress</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">⭐</span>
                    <span className={`text-xs font-medium ${labelText}`}>{earnedPoints} pts</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ${accentGradient}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Content */}
              <div className="mb-4">
                <h3 className={`text-lg font-bold ${labelText} mb-2`}>{step.title}</h3>
                <p className={`text-sm ${subtleText} leading-relaxed`}>
                  {step.description}
                </p>

                {/* Reward Preview */}
                {step.reward && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                    <span className="text-xs">🎁</span>
                    <span className="text-xs font-medium">
                      {step.reward.type === 'points' ? `+${step.reward.value} pts` :
                       step.reward.type === 'bonus_credits' ? 'Bonus credits!' :
                       step.reward.type === 'achievement' ? `${step.reward.value}` :
                       'Reward!'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center justify-between">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(currentStep - 1);
                    }
                  }}
                  disabled={currentStep === 0}
                  className={`text-xs px-3 py-2 rounded transition-colors ${
                    currentStep === 0
                      ? 'text-gray-500 cursor-not-allowed'
                      : `${subtleText} hover:text-current`
                  }`}
                >
                  ← Previous
                </button>

                {/* Action Button */}
                <button
                  onClick={handleStepAction}
                  disabled={isAnimating}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium text-white transition-all
                    ${accentGradient} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isAnimating ? 'animate-pulse' : ''}
                  `}
                >
                  {isAnimating ? 'Great! 🎉' : step.action}
                </button>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center mt-3 space-x-1">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentStep
                        ? 'bg-purple-400'
                        : i < currentStep
                        ? 'bg-emerald-400'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Reward Animation */}
        {isAnimating && step.reward && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="animate-bounce text-2xl">
              {step.reward.type === 'points' ? '⭐' :
               step.reward.type === 'bonus_credits' ? '🎁' :
               step.reward.type === 'achievement' ? '🏆' : '✨'}
            </div>
          </div>
        )}

      </GlassCard>
    </div>
  );
}