import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showSkip?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: 'center',
    title: 'Welcome to DevFocus! 🎯',
    description: 'A productivity-focused task manager built for developers. Let\'s take a quick tour of the key features.',
    position: 'center',
    showSkip: true,
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: 'Projects & Navigation 📁',
    description: 'Organize your tasks by projects. Click the toggle button to collapse/expand the sidebar. You can create, select, and delete projects here.',
    position: 'right',
  },
  {
    id: 'view-toggle',
    target: '[data-tour="view-toggle"]',
    title: 'Switch Views 🔄',
    description: 'Toggle between Kanban board view for visual task management or List view for a compact overview. Press "V" to switch quickly!',
    position: 'bottom',
  },
  {
    id: 'search',
    target: '[data-tour="search"]',
    title: 'Quick Search 🔍',
    description: 'Find tasks instantly by typing here. Press "/" to focus the search bar from anywhere in the app. Press "Esc" to clear.',
    position: 'bottom',
  },
  {
    id: 'task-board',
    target: '[data-tour="task-board"]',
    title: 'Task Board 📋',
    description: 'Manage your tasks with drag & drop. Move tasks between columns (Backlog → In Progress → Review → Done) to track progress.',
    position: 'top',
  },
  {
    id: 'add-task',
    target: '[data-tour="add-task"]',
    title: 'Create Tasks ➕',
    description: 'Click any "Add Task" button or press "N" to quickly create new tasks. You can add descriptions, tags, due dates, and subtasks.',
    position: 'left',
  },
  {
    id: 'timer',
    target: '[data-tour="timer"]',
    title: 'Focus Timer ⏱️',
    description: 'Use the built-in Pomodoro-style timer to stay focused. Set an active task and track your work sessions. Press "T" to start/pause.',
    position: 'bottom',
  },
  {
    id: 'help',
    target: '[data-tour="help"]',
    title: 'Keyboard Shortcuts ⌨️',
    description: 'Press "?" anytime to see all keyboard shortcuts. Power users can work efficiently without touching the mouse!',
    position: 'bottom',
  },
  {
    id: 'complete',
    target: 'center',
    title: 'You\'re All Set! 🚀',
    description: 'You can restart this tour anytime from the help menu or by pressing Shift+?. Now go build something amazing!',
    position: 'center',
  },
];

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  hasCompletedTour: boolean;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  skipTour: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = 'devfocus_tour_completed';

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    const saved = localStorage.getItem(TOUR_STORAGE_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    // Auto-start tour on first visit (after a short delay to let UI render)
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOUR_STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setHasCompletedTour(false);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const value: TourContextType = {
    isActive,
    currentStep,
    steps: TOUR_STEPS,
    hasCompletedTour,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    skipTour,
    resetTour,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
