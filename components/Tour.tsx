import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTour } from '../context/TourContext';
import { TourTooltip } from './TourTooltip';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const Tour: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour, endTour } = useTour();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentStepData = steps[currentStep];

  const calculatePosition = useCallback(() => {
    if (!currentStepData) return;

    if (currentStepData.target === 'center') {
      // Center position - tooltip will be centered by CSS
      setTargetRect(null);
      return;
    }

    const target = document.querySelector(currentStepData.target);
    if (!target) {
      // Target not found, skip to next step
      console.warn(`Tour target not found: ${currentStepData.target}`);
      return;
    }

    const rect = target.getBoundingClientRect();
    const padding = 8;

    setTargetRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Calculate tooltip position based on step position
    const tooltipWidth = 320; // w-80 = 320px
    const tooltipHeight = 200; // Approximate height
    const gap = 16;

    let x = 0;
    let y = 0;

    switch (currentStepData.position) {
      case 'top':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.top - tooltipHeight - gap;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.bottom + gap;
        break;
      case 'left':
        x = rect.left - tooltipWidth - gap;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = rect.right + gap;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      default:
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.bottom + gap;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    x = Math.max(16, Math.min(x, viewportWidth - tooltipWidth - 16));
    y = Math.max(16, Math.min(y, viewportHeight - tooltipHeight - 16));

    setTooltipPosition({ x, y });
  }, [currentStepData]);

  useEffect(() => {
    if (isActive) {
      // Delay slightly to ensure UI has rendered
      const timer = setTimeout(calculatePosition, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep, calculatePosition]);

  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      calculatePosition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endTour();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        prevStep();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, currentStep, endTour, nextStep, prevStep, calculatePosition]);

  if (!isActive || !currentStepData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Dark overlay with cutout */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left}
                  y={targetRect.top}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#tour-mask)"
            style={{ pointerEvents: 'auto' }}
            onClick={endTour}
          />
        </svg>

        {/* Highlight border around target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute border-2 border-indigo-500 rounded-lg pointer-events-none"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.5)',
            }}
          />
        )}

        {/* Pulse animation for target */}
        {targetRect && (
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute border-2 border-indigo-400 rounded-lg pointer-events-none"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
          />
        )}

        {/* Tooltip */}
        <TourTooltip
          step={currentStepData}
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          onClose={endTour}
          position={tooltipPosition}
        />

        {/* Keyboard hints */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 bg-slate-900/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700 dark:bg-slate-600 rounded text-white text-[10px]">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-700 dark:bg-slate-600 rounded text-white text-[10px]">→</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700 dark:bg-slate-600 rounded text-white text-[10px]">Esc</kbd>
            Close
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
