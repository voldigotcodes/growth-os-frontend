import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { trackEvent } from '../lib/apiClient.js';
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
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use standard theme text classes for proper contrast
  const labelText = 'theme-text-primary';
  const subtleText = 'theme-text-muted';
  const accentGradient = 'bg-gradient-to-r from-purple-500 to-pink-500';

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('growth-os-onboarding-completed');
    if (!hasCompletedOnboarding) {
      setIsVisible(true);
      trackEvent('onboarding_started');
    }
  }, []);

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
    localStorage.setItem('growth-os-onboarding-completed', 'true');

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

        await fetch('/api/credits/bonus', {
          method: 'POST',
          headers: {
            'X-User-ID': localStorage.getItem('growth-os-user-id'),
            'X-Session-ID': localStorage.getItem('growth-os-session-id')
          },
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

    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const skipOnboarding = async () => {
    await trackEvent('onboarding_skipped', {
      skipped_at_step: currentStep + 1,
      total_steps: ONBOARDING_STEPS.length
    });

    localStorage.setItem('growth-os-onboarding-completed', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <GlassCard className="relative w-full max-w-2xl">
        {/* Skip Button */}
        <button
          onClick={skipOnboarding}
          className={`absolute top-4 right-4 text-sm ${subtleText} hover:text-current transition-colors`}
        >
          Skip Tour
        </button>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${labelText}`}>
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span className={`text-sm font-medium ${labelText}`}>{earnedPoints} points</span>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${accentGradient}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${labelText} mb-4`}>{step.title}</h2>
          <p className={`text-lg ${subtleText} leading-relaxed max-w-xl mx-auto`}>
            {step.description}
          </p>

          {/* Reward Preview */}
          {step.reward && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              <span className="text-sm">🎁</span>
              <span className="text-sm font-medium">
                {step.reward.type === 'points' ? `+${step.reward.value} points` :
                 step.reward.type === 'bonus_credits' ? 'Bonus credits included!' :
                 step.reward.type === 'achievement' ? `Unlock: ${step.reward.value}` :
                 'Special reward!'}
              </span>
            </div>
          )}
        </div>

        {/* Visual Elements */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-16 rounded-lg transition-all duration-500 ${
                  i <= currentStep
                    ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="h-full flex items-center justify-center">
                  {i <= currentStep ? '✨' : '⬜'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStepAction}
            disabled={isAnimating}
            className={`
              px-8 py-4 rounded-lg font-medium text-white transition-all transform
              ${accentGradient} hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
              ${isAnimating ? 'animate-pulse' : ''}
            `}
          >
            {isAnimating ? 'Awesome! 🎉' : step.action}
          </button>
        </div>

        {/* Reward Animation */}
        {isAnimating && step.reward && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-bounce text-4xl">
              {step.reward.type === 'points' ? '⭐' :
               step.reward.type === 'bonus_credits' ? '🎁' :
               step.reward.type === 'achievement' ? '🏆' : '✨'}
            </div>
          </div>
        )}

        {/* Mini Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep
                  ? 'bg-purple-500'
                  : i < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-white/20'
              }`}
            ></div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}