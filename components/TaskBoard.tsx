import React, { useState } from 'react';
import { TaskStatus, STATUS_LABELS, Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { TaskCard } from './TaskCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface TaskBoardProps {
  onEditTask: (task: Task) => void;
  onNewTask: (status: TaskStatus) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ onEditTask, onNewTask }) => {
  const { filteredTasks, moveTask, reorderTask } = useTaskContext();
  const [dragInfo, setDragInfo] = useState<{ taskId: string; sourceStatus: TaskStatus } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ status: TaskStatus; index: number } | null>(null);

  const handleTaskDragStart = (taskId: string, sourceStatus: TaskStatus) => {
    setDragInfo({ taskId, sourceStatus });
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks
      .filter(t => t.status === status)
      .sort((a, b) => {
        const orderA = a.order ?? a.createdAt;
        const orderB = b.order ?? b.createdAt;
        return orderA - orderB;
      });
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus, targetIndex: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId') || e.dataTransfer.getData('text/plain');
    
    if (taskId && dragInfo) {
      if (dragInfo.sourceStatus === targetStatus) {
        // Reorder within same column
        reorderTask(taskId, targetIndex);
      } else {
        // Move to different column
        moveTask(taskId, targetStatus);
      }
    }
    setDragInfo(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleTaskDragOver = (e: React.DragEvent, status: TaskStatus, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragInfo && dragInfo.sourceStatus === status) {
      setDropTarget({ status, index });
    }
  };

  const handleTaskDragLeave = () => {
    setDropTarget(null);
  };

  return (
    <div data-tour="task-board" className="flex h-full gap-4 sm:gap-6 overflow-x-auto pb-4 items-start snap-x scrollbar-hide">
      {Object.values(TaskStatus).map((status) => (
        <div 
          key={status} 
          className="flex-shrink-0 w-72 sm:w-80 flex flex-col h-full max-h-full snap-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-200"
          onDrop={(e) => handleDrop(e, status, getTasksByStatus(status).length)}
          onDragOver={handleDragOver}
        >
          {/* Column Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 rounded-t-xl transition-colors duration-200">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                status === TaskStatus.DONE ? 'bg-emerald-500' : 
                status === TaskStatus.IN_PROGRESS ? 'bg-indigo-500' : 
                status === TaskStatus.REVIEW ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'
              }`} />
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {STATUS_LABELS[status]}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-500 font-mono bg-slate-200 dark:bg-slate-800 px-1.5 rounded">
                {getTasksByStatus(status).length}
              </span>
            </div>
            <button
              onClick={() => onNewTask(status)}
              className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition-colors"
              data-tour={status === 'BACKLOG' ? 'add-task' : undefined}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Task List Container */}
          <div 
            className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px] scrollbar-hide"
            onDrop={(e) => handleDrop(e, status, getTasksByStatus(status).length)}
            onDragOver={handleDragOver}
          >
            <AnimatePresence mode='popLayout'>
              {getTasksByStatus(status).map((task, index) => (
                <div key={task.id} className="space-y-3">
                  {dragInfo && dragInfo.sourceStatus === status && dropTarget?.status === status && dropTarget?.index === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-2 border-dashed border-indigo-400 dark:border-indigo-500 rounded-lg py-4 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10"
                    >
                      Drop task here
                    </motion.div>
                  )}
                  <div
                    onDragOver={(e) => handleTaskDragOver(e, status, index)}
                    onDragLeave={handleTaskDragLeave}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDrop(e, status, index);
                    }}
                  >
                    <TaskCard 
                      task={task} 
                      onEdit={onEditTask}
                      isDragging={dragInfo?.taskId === task.id}
                      onDragStart={handleTaskDragStart}
                    />
                  </div>
                </div>
              ))}
            </AnimatePresence>
            {getTasksByStatus(status).length === 0 && (
              <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs transition-colors duration-200">
                Drop tasks here
              </div>
            )}
            {dragInfo && dragInfo.sourceStatus === status && getTasksByStatus(status).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onDragOver={(e) => handleTaskDragOver(e, status, getTasksByStatus(status).length)}
                onDrop={(e) => handleDrop(e, status, getTasksByStatus(status).length)}
                className="border-2 border-dashed border-indigo-400 dark:border-indigo-500 rounded-lg py-4 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10"
              >
                Drop task here
              </motion.div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
