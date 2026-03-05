import React from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { cn } from '../utils/cn';
import { TourStep } from '../context/TourContext';

interface TourTooltipProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

export const TourTooltip: React.FC<TourTooltipProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose,
  position,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isCenterPosition = step.position === 'center';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        x: isCenterPosition ? '-50%' : 0,
      }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
        x: { duration: 0 }
      }}
      className={cn(
        'fixed z-[60] w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden',
        isCenterPosition && 'top-1/2 left-1/2 -translate-y-1/2'
      )}
      style={!isCenterPosition ? {
        left: position?.x ?? 0,
        top: position?.y ?? 0,
      } : undefined}
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white pr-4">
            {step.title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close tour"
          >
            <X size={18} />
          </button>
        </div>
        {/* Progress bar */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                index <= currentStep ? 'bg-white' : 'bg-white/30'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Footer with navigation */}
      <div className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {step.showSkip && (
            <button
              onClick={onSkip}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <SkipForward size={14} />
              Skip tour
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">
            {currentStep + 1} / {totalSteps}
          </span>

          {!isFirstStep && (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}

          <button
            onClick={onNext}
            className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            {isLastStep ? 'Finish' : 'Next'}
            {!isLastStep && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
