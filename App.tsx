import React, { useState } from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { TourProvider, useTour } from './context/TourContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskBoard } from './components/TaskBoard';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { KeyboardShortcutsGuide } from './components/KeyboardShortcutsGuide';
import { Tour } from './components/Tour';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTimer } from './hooks/useTimer';
import { Task, TaskStatus } from './types';
import LoginScreen from './components/LoginScreen';

const DevFocusApp: React.FC = () => {
  const {
    viewMode,
    user,
    isLoading,
    toggleSidebar,
    setViewMode,
    toggleTheme,
    setSearchQuery
  } = useTaskContext();
  const { resetTour } = useTour();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>(undefined);
  const [showShortcutsGuide, setShowShortcutsGuide] = useState(false);
  
  const timer = useTimer();

  const handleNewTask = (status?: TaskStatus) => {
    setEditingTask(null);
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleToggleViewMode = () => {
    setViewMode(viewMode === 'KANBAN' ? 'LIST' : 'KANBAN');
  };

  const handleSearchFocus = () => {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) searchInput.focus();
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) searchInput.blur();
  };

  useKeyboardShortcuts({
    onNewTask: () => handleNewTask(),
    onToggleSidebar: toggleSidebar,
    onToggleViewMode: handleToggleViewMode,
    onToggleTheme: toggleTheme,
    onShowShortcuts: () => setShowShortcutsGuide(true),
    onSearchFocus: handleSearchFocus,
    onSearchClear: handleSearchClear,
    onRestartTour: resetTour,
    viewMode,
    isModalOpen,
    timer: {
      isActive: timer.isActive,
      startTimer: timer.startTimer,
      pauseTimer: timer.pauseTimer,
      resetTimer: timer.resetTimer,
      toggleMode: timer.toggleMode,
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-200">
      
      <Sidebar onShowShortcuts={() => setShowShortcutsGuide(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onShowShortcuts={() => setShowShortcutsGuide(true)} />
        
        <main className="flex-1 overflow-hidden p-4 sm:p-6 relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-5 pointer-events-none z-0"></div>
          <div className="relative z-10 h-full">
            {viewMode === 'KANBAN' ? (
              <TaskBoard onEditTask={handleEditTask} onNewTask={handleNewTask} />
            ) : (
              <TaskList onEditTask={handleEditTask} />
            )}
          </div>
        </main>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        taskToEdit={editingTask}
        initialStatus={initialStatus}
      />

      <KeyboardShortcutsGuide
        isOpen={showShortcutsGuide}
        onClose={() => setShowShortcutsGuide(false)}
        viewMode={viewMode}
      />

      <Tour />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TaskProvider>
      <TourProvider>
        <DevFocusApp />
      </TourProvider>
    </TaskProvider>
  );
};

export default App;
