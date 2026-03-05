import { useEffect, useCallback, useRef } from 'react';
import { ViewMode } from '../types';

interface ShortcutsProps {
  onNewTask: () => void;
  onToggleSidebar?: () => void;
  onToggleViewMode?: () => void;
  onToggleTheme?: () => void;
  onShowShortcuts?: () => void;
  onSearchFocus?: () => void;
  onSearchClear?: () => void;
  onRestartTour?: () => void;
  viewMode?: ViewMode;
  isModalOpen?: boolean;
  timer?: {
    isActive: boolean;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    toggleMode: () => void;
  };
}

export const useKeyboardShortcuts = ({
  onNewTask,
  onToggleSidebar,
  onToggleViewMode,
  onToggleTheme,
  onShowShortcuts,
  onSearchFocus,
  onSearchClear,
  onRestartTour,
  viewMode: _viewMode,
  isModalOpen = false,
  timer,
}: ShortcutsProps) => {
  // Use refs to avoid re-attaching listeners on every render
  const callbacksRef = useRef({
    onNewTask,
    onToggleSidebar,
    onToggleViewMode,
    onToggleTheme,
    onShowShortcuts,
    onSearchFocus,
    onSearchClear,
    onRestartTour,
    timer,
  });

  // Keep refs up to date
  callbacksRef.current = {
    onNewTask,
    onToggleSidebar,
    onToggleViewMode,
    onToggleTheme,
    onShowShortcuts,
    onSearchFocus,
    onSearchClear,
    onRestartTour,
    timer,
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    const isContentEditable = target.isContentEditable;
    const isTyping = isInputField || isContentEditable;

    // Escape key handling
    if (e.key === 'Escape') {
      if (isTyping) {
        target.blur();
      } else if (callbacksRef.current.onSearchClear) {
        callbacksRef.current.onSearchClear();
      }
      return;
    }

    // Don't trigger other shortcuts when typing in input fields (unless modal is open)
    if (isTyping && !isModalOpen) {
      return;
    }

    // Don't trigger shortcuts when modal is open (except specific ones handled in modal)
    if (isModalOpen) {
      return;
    }

    const key = e.key.toLowerCase();

    switch (key) {
      case 'n':
        e.preventDefault();
        callbacksRef.current.onNewTask();
        break;
      case '/':
        e.preventDefault();
        callbacksRef.current.onSearchFocus?.();
        break;
      case '?':
      case 'h':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+? to restart tour
          callbacksRef.current.onRestartTour?.();
        } else {
          callbacksRef.current.onShowShortcuts?.();
        }
        break;
      case '[':
      case 'b':
        e.preventDefault();
        callbacksRef.current.onToggleSidebar?.();
        break;
      case 'v':
        e.preventDefault();
        callbacksRef.current.onToggleViewMode?.();
        break;
      case 't':
        e.preventDefault();
        callbacksRef.current.onToggleTheme?.();
        break;
      case ' ': // Space key
        // Only control timer if not typing and timer callbacks exist
        if (!isTyping && callbacksRef.current.timer) {
          e.preventDefault();
          const { isActive, startTimer, pauseTimer } = callbacksRef.current.timer;
          if (isActive) {
            pauseTimer();
          } else {
            startTimer();
          }
        }
        break;
      case 'r':
        if (!isTyping && callbacksRef.current.timer) {
          e.preventDefault();
          callbacksRef.current.timer.resetTimer();
        }
        break;
      case 'm':
        if (!isTyping && callbacksRef.current.timer) {
          e.preventDefault();
          callbacksRef.current.timer.toggleMode();
        }
        break;
      default:
        break;
    }
  }, [isModalOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook specifically for modal shortcuts
interface ModalShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

export const useModalShortcuts = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
}: ModalShortcutsProps) => {
  const callbacksRef = useRef({ onClose, onSave, onDelete });
  callbacksRef.current = { onClose, onSave, onDelete };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        callbacksRef.current.onClose();
        return;
      }

      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        callbacksRef.current.onSave?.();
        return;
      }

      // Ctrl/Cmd + Enter to save
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        callbacksRef.current.onSave?.();
        return;
      }

      // Delete key to delete (when not in input field)
      const target = e.target as HTMLElement;
      const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      const isContentEditable = target.isContentEditable;

      if (e.key === 'Delete' && !isInputField && !isContentEditable && callbacksRef.current.onDelete) {
        e.preventDefault();
        callbacksRef.current.onDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);
};

// Export keyboard shortcuts configuration for the guide
export interface ShortcutCategory {
  name: string;
  shortcuts: { key: string; description: string }[];
}

export const getShortcutsConfig = (viewMode?: ViewMode): ShortcutCategory[] => [
  {
    name: 'General',
    shortcuts: [
      { key: '?', description: 'Show keyboard shortcuts guide' },
      { key: 'N', description: 'Create new task' },
      { key: '/', description: 'Focus search' },
      { key: 'Esc', description: 'Close modal / Clear search / Blur input' },
    ],
  },
  {
    name: 'Navigation',
    shortcuts: [
      { key: '[ or B', description: 'Toggle sidebar' },
      { key: 'V', description: `Switch to ${viewMode === 'KANBAN' ? 'List' : 'Board'} view` },
      { key: 'T', description: 'Toggle dark/light theme' },
      { key: 'Shift + ?', description: 'Restart onboarding tour' },
    ],
  },
  {
    name: 'Timer',
    shortcuts: [
      { key: 'Space', description: 'Start/pause timer' },
      { key: 'R', description: 'Reset timer' },
      { key: 'M', description: 'Toggle Focus/Break mode' },
    ],
  },
  {
    name: 'Task Modal',
    shortcuts: [
      { key: 'Esc', description: 'Close without saving' },
      { key: 'Ctrl + S', description: 'Save task' },
      { key: 'Ctrl + Enter', description: 'Save task' },
    ],
  },
];
