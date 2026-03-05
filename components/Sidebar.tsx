import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Layout, ListTodo, Hash, Plus, ChevronLeft, ChevronRight, Keyboard, Trash2, Layers, Sun, Moon, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';

interface SidebarProps {
  onShowShortcuts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onShowShortcuts }) => {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    setSidebarOpen,
    projects, 
    viewMode, 
    setViewMode, 
    addProject, 
    deleteProject,
    selectedProjectId,
    setSelectedProject,
    theme,
    toggleTheme
  } = useTaskContext();
  
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartCreate = () => {
    if (!sidebarOpen) setSidebarOpen(true);
    setIsCreatingProject(true);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const colors = [
        'text-indigo-400', 'text-emerald-400', 'text-pink-400', 
        'text-cyan-400', 'text-amber-400', 'text-rose-400', 'text-violet-400'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      addProject({ name: newProjectName.trim(), color });
      setNewProjectName('');
      setIsCreatingProject(false);
    } else {
        setIsCreatingProject(false);
    }
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const getProjectName = () => {
    return projects.find(p => p.id === projectToDelete)?.name || 'this project';
  };

  const handleProjectClick = (projectId: string) => {
    if (selectedProjectId === projectId) {
      setSelectedProject(null);
    } else {
      setSelectedProject(projectId);
    }
    // On mobile, close sidebar after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const sidebarVariants = {
    open: { width: 240, x: 0 },
    closed: { width: isMobile ? 0 : 64, x: isMobile ? -240 : 0 }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        data-tour="sidebar"
        initial={false}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className={cn(
            "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 z-40",
            isMobile ? "fixed left-0 top-0 shadow-2xl" : "relative"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <AnimatePresence mode='wait'>
            {sidebarOpen && (
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent"
                >
                    DevFocus
                </motion.span>
            )}
          </AnimatePresence>
          
          <button 
            onClick={toggleSidebar} 
            className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            {isMobile ? <X size={20} /> : (sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-2 space-y-6 scrollbar-hide">
          {/* Views */}
          <div className="space-y-1" data-tour="view-toggle">
            {sidebarOpen && <h4 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Views</h4>}
            <button
              onClick={() => { setViewMode('KANBAN'); if(isMobile) setSidebarOpen(false); }}
              className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors", 
                viewMode === 'KANBAN' 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Layout size={20} />
              {sidebarOpen && <span className="text-sm font-medium">Board</span>}
            </button>
            <button 
              onClick={() => { setViewMode('LIST'); if(isMobile) setSidebarOpen(false); }}
              className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors", 
                viewMode === 'LIST' 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <ListTodo size={20} />
              {sidebarOpen && <span className="text-sm font-medium">List</span>}
            </button>
          </div>

          {/* Projects */}
          <div className="space-y-1">
            {sidebarOpen && (
               <div className="flex items-center justify-between px-3 mb-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</h4>
                  <button 
                      onClick={handleStartCreate}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                      title="Add Project"
                  >
                      <Plus size={14}/>
                  </button>
               </div>
            )}
            
            {/* Project Creation Input */}
            {sidebarOpen && isCreatingProject && (
              <form onSubmit={handleCreateProject} className="px-2 mb-2">
                  <input
                      
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onBlur={() => { if (!newProjectName) setIsCreatingProject(false); }}
                      onKeyDown={(e) => { if(e.key === 'Escape') setIsCreatingProject(false); }}
                      placeholder="Project Name..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                  />
              </form>
            )}

            {sidebarOpen && (
              <button 
                onClick={() => { setSelectedProject(null); if(isMobile) setSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                  selectedProjectId === null 
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Layers size={18} className={selectedProjectId === null ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"} />
                <span className="text-sm font-medium">All Projects</span>
              </button>
            )}

            {projects.map(project => {
              const isSelected = selectedProjectId === project.id;
              return (
                <div key={project.id} className="group relative">
                    <button 
                      onClick={() => handleProjectClick(project.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                        isSelected 
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      <Hash size={18} className={cn("shrink-0", project.color)} />
                      {sidebarOpen && <span className="text-sm truncate">{project.name}</span>}
                      {sidebarOpen && isSelected && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                      )}
                    </button>
                    {sidebarOpen && (
                        <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault();
                              setProjectToDelete(project.id);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-md opacity-0 group-hover:opacity-100 md:opacity-0 opacity-100 transition-all z-10"
                            title="Delete project"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button 
                onClick={toggleTheme}
                className="flex items-center gap-3 px-2 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                title="Toggle Theme"
            >
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                {sidebarOpen && <span className="text-sm">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
            </button>
            
            {sidebarOpen && onShowShortcuts && (
                <button
                    onClick={onShowShortcuts}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Keyboard shortcuts (?)"
                >
                    <Keyboard size={20} />
                </button>
            )}
        </div>
      </motion.aside>

      <ConfirmationModal 
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDeleteProject}
        title="Delete Project?"
        message={`Are you sure you want to delete "${getProjectName()}"? This action cannot be undone and will remove the project tag from associated tasks.`}
        confirmLabel="Delete Project"
      />
    </>
  );
};