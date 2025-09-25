import { memo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import PrimaryButton from '../PrimaryButton.jsx';

const steps = [
  { title: 'Welcome to Workflows', description: 'Create automated content pipelines with visual tools', icon: '⚡' },
  { title: 'Add a tool', description: 'Drag an automation tile from the palette to get started', icon: '🛠️' },
  { title: 'Connect the ports', description: 'Match glowing badges with the same icon & type', icon: '🔗' },
  { title: 'Save & run', description: 'Give it a name, hit run, and watch the glass glow', icon: '🚀' },
];

function OnboardingOverlay({ onComplete }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-8 text-center bg-black/20 backdrop-blur-sm">
      <div className={[
        "liquid-glass-onboard relative w-full max-w-md rounded-[28px] border p-8",
        isDark
          ? "border-white/15 bg-white/8 shadow-[0_40px_80px_rgba(15,23,42,0.4)]"
          : "border-slate-300/30 bg-white/90 shadow-[0_40px_80px_rgba(148,163,184,0.3)]"
      ].join(' ')}>
        <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-rose-400/40 via-sky-400/30 to-emerald-400/40 blur-3xl opacity-60" aria-hidden />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[11px] uppercase tracking-[0.35em]",
              isDark
                ? "border-white/20 bg-white/10 text-white/70"
                : "border-slate-300/40 bg-slate-100/80 text-slate-600"
            ].join(' ')}>
              Step {currentStep + 1} of {steps.length}
            </div>
            <button
              onClick={() => onComplete?.()}
              className={`text-sm ${isDark ? 'text-white/60 hover:text-white/80' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Skip
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl">{currentStepData.icon}</span>
            <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {currentStepData.title}
            </h2>
            <p className={`text-base ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              {currentStepData.description}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 py-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={[
                  "h-2 w-2 rounded-full transition-colors",
                  index === currentStep
                    ? isDark ? "bg-white" : "bg-slate-800"
                    : isDark ? "bg-white/30" : "bg-slate-300"
                ].join(' ')}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <PrimaryButton
                variant="secondary"
                onClick={handlePrevious}
                className="flex-1"
              >
                Previous
              </PrimaryButton>
            )}
            <PrimaryButton
              onClick={handleNext}
              className="flex-1"
              icon={isLastStep ? '🚀' : '→'}
              iconPosition="right"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(OnboardingOverlay);
