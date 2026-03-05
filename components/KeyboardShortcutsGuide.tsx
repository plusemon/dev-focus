import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { getShortcutsConfig, ShortcutCategory } from '../hooks/useKeyboardShortcuts';
import { ViewMode } from '../types';

interface KeyboardShortcutsGuideProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode?: ViewMode;
}

const ShortcutKey: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <kbd
    className={cn(
      'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded',
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      'border border-slate-300 dark:border-slate-600 shadow-sm',
      'min-w-[24px]',
      className
    )}
  >
    {children}
  </kbd>
);

const ShortcutRow: React.FC<{ shortcut: { key: string; description: string } }> = ({ shortcut }) => {
  // Split compound keys (like "Ctrl + S" or "[ or B")
  const keys = shortcut.key.split(/(\s+or\s+|\s*\+\s*)/).filter(k => !k.match(/^(\s+or\s+|\s*\+\s*)$/));

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <span className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</span>
      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <ShortcutKey>{key.trim()}</ShortcutKey>
            {index < keys.length - 1 && <span className="text-slate-400 text-xs">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const CategorySection: React.FC<{ category: ShortcutCategory }> = ({ category }) => (
  <div className="mb-6 last:mb-0">
    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
      {category.name}
    </h3>
    <div className="space-y-0.5">
      {category.shortcuts.map((shortcut, index) => (
        <ShortcutRow key={`${category.name}-${index}`} shortcut={shortcut} />
      ))}
    </div>
  </div>
);

export const KeyboardShortcutsGuide: React.FC<KeyboardShortcutsGuideProps> = ({
  isOpen,
  onClose,
  viewMode,
}) => {
  const shortcutsConfig = getShortcutsConfig(viewMode);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div
              className={cn(
                'w-full max-w-lg max-h-[85vh] overflow-hidden',
                'bg-white dark:bg-slate-900',
                'rounded-2xl shadow-2xl',
                'border border-slate-200 dark:border-slate-700',
                'pointer-events-auto'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                    <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Press <ShortcutKey className="!py-0">?</ShortcutKey> anytime to show this guide
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[60vh] p-6 scrollbar-hide">
                {shortcutsConfig.map((category, index) => (
                  <CategorySection key={category.name} category={category} />
                ))}

                {/* Tip */}
                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    <strong>Pro tip:</strong> Most shortcuts work even when a text field is focused.
                    Use <ShortcutKey className="!bg-indigo-100 dark:!bg-indigo-500/20 !border-indigo-200 dark:!border-indigo-500/30 !text-indigo-700 dark:!text-indigo-300">Esc</ShortcutKey> to blur inputs first.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-center text-slate-500 dark:text-slate-500">
                  Shortcuts are disabled when typing in text fields
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
